// -----------------------------------------------------------------------------
// AvailabilitySelector.tsx - Day-of-week selector for activity availability
// -----------------------------------------------------------------------------
// Provides a row of toggle buttons for each day of the week, allowing users
// to select which days an activity is available. Used in ActivityForm.
//
// Props:
//   - available_sun ... available_sat: booleans for each day
//   - onToggle: callback(dayKey) when a day is toggled
// -----------------------------------------------------------------------------

import React, { useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";

// Explicitly type the props for better type safety
interface AvailabilitySelectorProps {
  available_sun: boolean;
  available_mon: boolean;
  available_tue: boolean;
  available_wed: boolean;
  available_thu: boolean;
  available_fri: boolean;
  available_sat: boolean;
  onToggle: (dayKey: string) => void;
}

// AvailabilitySelector: Row of toggle buttons for each day of the week
export default function AvailabilitySelector({
  available_sun,
  available_mon,
  available_tue,
  available_wed,
  available_thu,
  available_fri,
  available_sat,
  onToggle,
}: AvailabilitySelectorProps) {
  const colorScheme = useColorScheme();

  // List of days and their current values
  const days = [
    { key: "sun", value: available_sun },
    { key: "mon", value: available_mon },
    { key: "tue", value: available_tue },
    { key: "wed", value: available_wed },
    { key: "thu", value: available_thu },
    { key: "fri", value: available_fri },
    { key: "sat", value: available_sat },
  ];

  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "icon");
  const textColor = useThemeColor({}, "text");

  // Render a button for each day, blue if selected, gray if not
  return (
    <View style={styles.container}>
      {days.map(({ key, value }) => (
        <TouchableOpacity
          key={key}
          onPress={() => onToggle(key)}
          style={[
            styles.day,
            {
              backgroundColor: value ? "#007AFF" : backgroundColor, // Blue for true, background for false
              borderColor: value ? "#007AFF" : iconColor,
            },
          ]}
        >
          <Text style={{ color: value ? "white" : textColor, fontWeight: value ? "bold" : "normal" }}>{key.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "nowrap", // Prevent wrapping
    justifyContent: "space-between", // Spread days evenly
    marginBottom: 10,
    alignItems: "center",
  },
  day: {
    marginHorizontal: 2,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 5,
    minWidth: 36,
    alignItems: "center",
  },
});
