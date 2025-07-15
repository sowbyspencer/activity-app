import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, Text, Image, Animated, PanResponder, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { fetchActivities, swipeActivity, resetDeclinedActivities } from "@/api/activityService";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import useDeviceLocation from "@/hooks/useDeviceLocation";
import * as Linking from "expo-linking";
import { useRadius } from "@/context/RadiusContext";
import { useRouter } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface Activity {
  id: number;
  name: string;
  description: string;
  location: string;
  has_cost: boolean;
  cost: number | null;
  available_sun: boolean;
  available_mon: boolean;
  available_tue: boolean;
  available_wed: boolean;
  available_thu: boolean;
  available_fri: boolean;
  available_sat: boolean;
  url: string;
  images: string[];
}

// Helper to merge new activities, avoiding duplicates
function mergeUniqueActivities(prev: Activity[], newData: Activity[]): Activity[] {
  if (!Array.isArray(newData)) {
    console.error("mergeUniqueActivities: newData is not an array", newData);
    return prev;
  }
  const existingIds = new Set(prev.map((a) => a.id));
  const uniqueNew = newData.filter((a) => !existingIds.has(a.id));
  return [...prev, ...uniqueNew];
}

// Helper to wrap async actions with loading state
async function withLoading(setLoading: (loading: boolean) => void, asyncAction: () => Promise<void>) {
  setLoading(true);
  await asyncAction();
  setLoading(false);
}

// Helper to reset declined activities and fetch new activities
async function resetAndFetchActivities(
  userId: number,
  coords: { latitude: number; longitude: number } | null,
  fetchAndSetActivities: (loc?: { latitude: number; longitude: number } | null) => Promise<void>,
  setLoading: (loading: boolean) => void
) {
  await withLoading(setLoading, async () => {
    await resetDeclinedActivities(userId);
    await fetchAndSetActivities(coords ?? undefined);
  });
}

export default function ActivitySwiper() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { userId } = useAuth();
  const { radius, setRadius } = useRadius();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locationRefreshKey, setLocationRefreshKey] = useState(0);
  const { coords, errorMsg } = useDeviceLocation(locationRefreshKey);
  const [lastFetchedLocation, setLastFetchedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const router = useRouter();

  // Animated values for swiping
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const skipNextFocusRefresh = useRef(false);

  // Fetch data
  // Fetch activities from the server and add to the bottom of the stack
  // loc: optional latitude/longitude to use for the fetch
  const fetchAndSetActivities = useCallback(
    async (loc?: { latitude: number; longitude: number } | null, r?: number) => {
      if (!userId || !loc) return;
      const effectiveRadius = r ?? radius;
      console.log("[ActivitySwiper] Fetching activities with radius:", effectiveRadius);
      await withLoading(setLoading, async () => {
        const data = await fetchActivities(userId, { coords: loc }, effectiveRadius);
        // Remove activities not in the new fetch
        setActivities((prev) => {
          const newIds = new Set(data.map((a) => a.id));
          // Keep only activities in both prev and new fetch
          const filteredPrev = prev.filter((a) => newIds.has(a.id));
          // Add new activities not already in prev
          const existingIds = new Set(filteredPrev.map((a) => a.id));
          const uniqueNew = data.filter((a) => !existingIds.has(a.id));
          return [...filteredPrev, ...uniqueNew];
        });
        setLastFetchedLocation(loc);
      });
    },
    [userId, radius]
  );

  // When location changes, fetch if different from lastFetchedLocation
  useEffect(() => {
    if (!userId || !coords) return;
    const { latitude, longitude } = coords;
    if (!lastFetchedLocation || lastFetchedLocation.latitude !== latitude || lastFetchedLocation.longitude !== longitude) {
      fetchAndSetActivities({ latitude, longitude }, radius);
    }
  }, [coords, userId, radius]);

  // Reset state when user logs out
  useEffect(() => {
    if (!userId) {
      console.log("[ActivitySwiper] RESET effect, userId:", userId);
      setActivities([]);
      setCurrentActivity(0);
      setCurrentImage(0);
      setLoading(true);
    }
  }, [userId]);

  // Refresh activities every time the page is focused, except when returning from activityInfo
  useFocusEffect(
    useCallback(() => {
      if (skipNextFocusRefresh.current) {
        skipNextFocusRefresh.current = false;
        translateX.setValue(0);
        translateY.setValue(0);
        return;
      }
      if (userId) {
        if (coords) {
          fetchAndSetActivities(coords, radius);
        } else {
          // fetchAndSetActivities(undefined, radius);
          console.warn("[ActivitySwiper] No coords available to fetch activities");
        }
      }
      translateX.setValue(0);
      translateY.setValue(0);
    }, [userId, coords, radius])
  );

  const TAP_THRESHOLD = 10; // Movement threshold to detect taps

  // Helper: Remove current activity from stack
  const removeCurrentActivity = () => {
    setActivities((prev) => {
      const newActivities = prev.filter((_, idx) => idx !== currentActivity);
      if (newActivities.length === 0 && userId) {
        // Refresh activities if stack is empty
        fetchAndSetActivities(undefined, radius);
      }
      return newActivities;
    });
    setCurrentActivity(0);
    setCurrentImage(0);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderMove: (_, gesture) => {
      if (Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5) {
        translateX.setValue(gesture.dx);
      } else if (Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.5) {
        translateY.setValue(gesture.dy);
      }
    },

    onPanResponderRelease: async (_, gesture) => {
      if (!activities.length) return;

      // **Tap Detection**
      if (Math.abs(gesture.dx) < TAP_THRESHOLD && Math.abs(gesture.dy) < TAP_THRESHOLD) {
        skipNextFocusRefresh.current = true;
        navigation.navigate(
          "activityInfo" as never,
          {
            activity: activities[currentActivity],
            image: activities[currentActivity]?.images[currentImage],
          } as never
        );
        return;
      }

      // **LEFT / RIGHT** - Switch images
      if (Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 100) {
        const nextImageIndex =
          gesture.dx < 0 ? Math.min(currentImage + 1, activities[currentActivity].images.length - 1) : Math.max(currentImage - 1, 0);

        Animated.timing(translateX, {
          toValue: gesture.dx < 0 ? -SCREEN_WIDTH : SCREEN_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setCurrentImage(nextImageIndex);
          translateX.setValue(0);
        });

        // **UP / DOWN** - Remove activity and record swipe
      } else if (Math.abs(gesture.dy) > 100) {
        const liked = gesture.dy < 0; // Up = like, Down = dislike
        const activity = activities[currentActivity];
        if (userId && activity) {
          swipeActivity(Number(userId), activity.id, liked);
        }
        Animated.timing(translateY, {
          toValue: gesture.dy < 0 ? -SCREEN_HEIGHT : SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          removeCurrentActivity();
          translateY.setValue(0);
        });
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  // Add this handler for refresh
  const handleRefresh = () => {
    Alert.alert("Refresh Declined Activities", "Do you want to refresh Declined activities?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Refresh",
        style: "destructive",
        onPress: async () => {
          if (userId) {
            await resetAndFetchActivities(Number(userId), coords, fetchAndSetActivities, setLoading);
          }
        },
      },
    ]);
  };

  // Show view while waiting for location data
  if (!coords && !errorMsg) {
    const handleRefreshLocation = async () => {
      // Re-request location permissions and refresh location
      try {
        const { status } = await import("expo-location").then((Location) => Location.requestForegroundPermissionsAsync());
        if (status === "granted") {
          const loc = await import("expo-location").then((Location) => Location.getCurrentPositionAsync({}));
          if (loc && loc.coords) {
            // Manually update location state
            setActivities([]); // Optionally clear activities to force reload
            fetchAndSetActivities({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          }
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colorScheme === "dark" ? "black" : "white",
        }}
      >
        <ActivityIndicator size="large" color="blue" />
        <Text style={{ color: colorScheme === "dark" ? "white" : "black" }}>Waiting for location data...</Text>
        <TouchableOpacity
          style={{ marginTop: 24, backgroundColor: "#007AFF", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          onPress={handleRefreshLocation}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Refresh Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show view if location permissions are denied
  if (errorMsg) {
    const handleOpenSettings = async () => {
      try {
        await Linking.openSettings();
        setTimeout(async () => {
          const { status } = await import("expo-location").then((Location) => Location.requestForegroundPermissionsAsync());
          if (status === "granted") {
            const loc = await import("expo-location").then((Location) => Location.getCurrentPositionAsync({}));
            if (loc && loc.coords) {
              setActivities([]); // Optionally clear activities to force reload
              fetchAndSetActivities({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
              setLocationRefreshKey((k) => k + 1); // Force hook to refresh
            }
          }
        }, 1500);
      } catch (e) {
        // Optionally handle error
      }
    };
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colorScheme === "dark" ? "black" : "white",
        }}
      >
        <Ionicons name="location" size={48} color="red" style={{ marginBottom: 16 }} />
        <Text style={{ color: colorScheme === "dark" ? "white" : "black", fontSize: 18, textAlign: "center" }}>{errorMsg}</Text>
        <Text style={{ color: colorScheme === "dark" ? "white" : "black", marginTop: 8, textAlign: "center" }}>
          Please enable location permissions in your device settings.
        </Text>
        <TouchableOpacity
          style={{ marginTop: 24, backgroundColor: "#007AFF", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          onPress={handleOpenSettings}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Open App Permission Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colorScheme === "dark" ? "black" : "white",
        }}
      >
        <ActivityIndicator size="large" color="blue" />
        <Text style={{ color: colorScheme === "dark" ? "white" : "black" }}>Loading Activities...</Text>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colorScheme === "dark" ? "black" : "white",
        }}
      >
        <Text style={{ fontSize: 20, color: colorScheme === "dark" ? "white" : "black", marginBottom: 20, textAlign: "center" }}>
          No more activities to swipe!
        </Text>
        <Text style={{ fontSize: 16, color: colorScheme === "dark" ? "white" : "black", marginBottom: 16, textAlign: "center" }}>
          To view more activities:
        </Text>
        {/* Increase Distance Button visually above Refresh Declined Activities */}
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
          onPress={() => router.push({ pathname: "/(tabs)/(settings)/settings" })}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Increase Distance</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, color: colorScheme === "dark" ? "white" : "black", marginBottom: 8, textAlign: "center" }}>or</Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onPress={async () => {
            setCurrentActivity(0);
            setCurrentImage(0);
            if (userId) {
              await resetAndFetchActivities(Number(userId), coords, fetchAndSetActivities, setLoading);
            }
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Refresh Declined Activities</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "black" : "white",
      }}
    >
      {/* Refresh Button */}
      <TouchableOpacity
        onPress={handleRefresh}
        style={{
          position: "absolute",
          top: 60, // Move below the header (header is 60px, plus 18px spacing)
          right: 18,
          zIndex: 10,
          opacity: 0.5,
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="refresh" size={32} color={colorScheme === "dark" ? "white" : "black"} />
      </TouchableOpacity>
      {/* Activity Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          transform: [{ translateY }],
        }}
      >
        {/* Header */}
        <Animated.View
          style={{
            width: "100%",
            height: 60,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colorScheme === "dark" ? "#222" : "#f5f5f5",
            transform: [
              {
                translateY: translateY.interpolate({
                  inputRange: [-SCREEN_HEIGHT, 0, SCREEN_HEIGHT],
                  outputRange: [-60, 0, 60],
                }),
              },
            ],
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: colorScheme === "dark" ? "white" : "black",
              fontWeight: "bold",
            }}
          >
            {activities[currentActivity]?.name}
          </Text>
        </Animated.View>

        {/* Image Swiper */}
        <TouchableOpacity activeOpacity={0.8}>
          <Animated.View
            style={{
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT - 100,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ translateX }],
            }}
          >
            <Image
              key={`${currentActivity}-${currentImage}`}
              source={{
                uri: activities[currentActivity]?.images[currentImage],
              }}
              style={{
                width: SCREEN_WIDTH,
                height: "100%",
                resizeMode: "cover",
              }}
            />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
