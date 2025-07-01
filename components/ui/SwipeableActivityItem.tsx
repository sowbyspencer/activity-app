import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

export type SwipeableActivityItemHandle = {
  close: () => void;
};

export type SwipeableActivityItemProps = {
  children: React.ReactNode;
  onDelete: (closeSwipe?: () => void) => void;
  deleteLabel?: string;
  deleteColor?: string;
  onSwipeableOpen?: () => void;
};

const SwipeableActivityItem = forwardRef<SwipeableActivityItemHandle, SwipeableActivityItemProps>(
  ({ children, onDelete, deleteLabel = "Delete", deleteColor = "#B00020", onSwipeableOpen }, ref) => {
    const swipeableRef = useRef<Swipeable | null>(null);
    useImperativeHandle(ref, () => ({ close: () => swipeableRef.current?.close && swipeableRef.current.close() }));

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
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
      <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} onSwipeableOpen={onSwipeableOpen}>
        {children}
      </Swipeable>
    );
  }
);

export default SwipeableActivityItem;

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
