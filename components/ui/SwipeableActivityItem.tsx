import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

export default function SwipeableActivityItem({ children, onDelete, deleteLabel = "Delete", deleteColor = "#B00020" }) {
  const swipeableRef = useRef<Swipeable | null>(null);

  // Use Animated for the right action so we can animate its appearance
  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    // As progress goes from 0 (closed) to 1 (fully open), scaleX goes from 0.7 to 1
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
      extrapolate: "clamp",
    });
    const opacity = progress.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.7, 1],
      extrapolate: "clamp",
    });
    return (
      <Animated.View style={[styles.deleteButton, { backgroundColor: deleteColor, transform: [{ scale }], opacity }]}>
        <TouchableOpacity
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          onPress={() => onDelete(() => swipeableRef.current?.close && swipeableRef.current.close())}
        >
          <Text style={styles.deleteText}>{deleteLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: "100%",
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
