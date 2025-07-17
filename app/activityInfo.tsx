/**
 * ActivityInfoScreen
 *
 * This screen displays detailed information about a selected activity, including a blurred background image, an info panel, and a persistent bottom navigation bar.
 * It animates in with a slide-up effect and handles the Android hardware back button to close with an animation.
 *
 * Props:
 *   - Receives `activity` and `image` via navigation route params.
 *
 * Key Features:
 *   - Animated slide-in/out for modal-like presentation
 *   - Blurred background image for visual emphasis
 *   - InfoPanel component for activity details
 *   - Handles Android hardware back button for smooth UX
 *   - Persistent BottomTabLayout navigation bar
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Dimensions,
  Animated,
  BackHandler,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BlurView } from "expo-blur";
import { useNavigation, useRoute } from "@react-navigation/native";
import BottomTabLayout from "@/components/BottomTabLayout"; // ✅ Import Navigation Bar Component
import InfoPanel from "@/components/ui/InfoPanel";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const BOTTOM_NAV_HEIGHT = 105; // Adjust to match the actual height of BottomTabLayout

export default function ActivityInfoScreen() {
  // Get current color scheme (light/dark) for theming
  const colorScheme = useColorScheme();
  // Navigation and route hooks from React Navigation
  const navigation = useNavigation();
  const route = useRoute();
  // Destructure activity and image from route params
  const { activity, image } = route.params || {}; // Receives data from navigation

  // Animated value for slide-in/out effect
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // Starts offscreen

  // If no activity is provided, show error and back button
  if (!activity) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: "red" }}>Activity not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: "blue" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    // Animate slide-up effect when the screen is opened
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Handle native back button on Android
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleClose();
        return true;
      }
    );

    // Clean up back handler on unmount
    return () => backHandler.remove();
  }, []);

  // Close animation before navigating back
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => navigation.goBack());
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
    >
      {/* Background Image with blur for visual effect */}
      <Image
        source={{ uri: image }} // Use first image
        style={styles.backgroundImage}
        blurRadius={10} // Adds blur effect
      />
      <BlurView
        intensity={colorScheme === "dark" ? 130 : 120}
        tint={colorScheme}
        style={styles.blurOverlay}
      />

      {/* InfoPanel displays main activity details */}
      <InfoPanel activity={activity} />

      {/* Fake Navigation Bar - Positioned at the bottom */}
      <View style={styles.fakeNavContainer}>
        <BottomTabLayout />
      </View>
    </Animated.View>
  );
}

// Styles for layout, background, overlays, and error state
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  backgroundImage: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - BOTTOM_NAV_HEIGHT, // Prevents it from covering the nav
    resizeMode: "cover",
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject, // Covers everything
  },
  contentWrapper: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  text: {
    marginBottom: 10,
  },
  linkText: {
    color: "lightblue",
    marginTop: 10,
  },
  fakeNavContainer: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH,
    height: BOTTOM_NAV_HEIGHT,
    backgroundColor: "transparent", // Ensure it doesn't block anything
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black", // Adjust for light/dark mode if needed
  },
});
