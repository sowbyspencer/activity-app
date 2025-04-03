import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function AvailabilitySelector({ availability, onToggle }) {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((day) => (
        <TouchableOpacity
          key={day}
          onPress={() => onToggle(day)}
          style={[
            styles.day,
            {
              backgroundColor: availability[day]
                ? "#007AFF"
                : colorScheme === "dark"
                ? "#1e1e1e"
                : "white",
              borderColor: availability[day] ? "#007AFF" : "#ccc",
            },
          ]}
        >
          <Text
            style={{
              color: availability[day]
                ? "white"
                : colorScheme === "dark"
                ? "white"
                : "black",
            }}
          >
            {day.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  day: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderRadius: 5,
  },
});
