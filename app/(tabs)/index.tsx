import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, Text, Image, Animated, PanResponder, Dimensions, ActivityIndicator, TouchableOpacity } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { fetchActivities, swipeActivity } from "@/api/activityService";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/api/config";

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

export default function ActivitySwiper() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { userId } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Animated values for swiping
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Fetch data
  useEffect(() => {
    console.log("[ActivitySwiper] useEffect RUN, userId:", userId);
    if (!userId) return;
    setActivities([]);
    setLoading(true);
    let isActive = true;
    const loadActivities = async () => {
      console.log("[ActivitySwiper] fetchActivities CALLED, userId:", userId);
      const data = await fetchActivities(userId);
      if (isActive) {
        console.log("[ActivitySwiper] setActivities CALLED, activities.length:", data.length);
        setActivities(data);
        setLoading(false);
      }
    };
    loadActivities();
    return () => {
      isActive = false;
      console.log("[ActivitySwiper] useEffect CLEANUP, userId:", userId);
    };
  }, [userId]);

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

  useFocusEffect(
    useCallback(() => {
      translateX.setValue(0);
      translateY.setValue(0);
    }, [])
  );

  const TAP_THRESHOLD = 10; // Movement threshold to detect taps

  // Helper: Remove current activity from stack
  const removeCurrentActivity = () => {
    setActivities((prev) => prev.filter((_, idx) => idx !== currentActivity));
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
        <Text style={{ fontSize: 20, color: colorScheme === "dark" ? "white" : "black", marginBottom: 20 }}>No more activities to swipe!</Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onPress={async () => {
            setLoading(true);
            setCurrentActivity(0);
            setCurrentImage(0);
            // Call backend to reset declined activities for this user
            await fetch(`${API_URL}/activities/reset-swipes`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: Number(userId) }),
            });
            // Refetch activities
            const data = await fetchActivities(Number(userId));
            setActivities(data);
            setLoading(false);
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
