import React, { useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function AvailabilitySelector({
  available_sun,
  available_mon,
  available_tue,
  available_wed,
  available_thu,
  available_fri,
  available_sat,
  onToggle,
}) {
  const colorScheme = useColorScheme();

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

  // useEffect(() => {
  //   console.log("AvailabilitySelector initialized with:", {
  //     available_sun,
  //     available_mon,
  //     available_tue,
  //     available_wed,
  //     available_thu,
  //     available_fri,
  //     available_sat,
  //   });
  // }, []);

  // useEffect(() => {
  //   console.log("Day toggled, updated values:", {
  //     available_sun,
  //     available_mon,
  //     available_tue,
  //     available_wed,
  //     available_thu,
  //     available_fri,
  //     available_sat,
  //   });
  // }, [available_sun, available_mon, available_tue, available_wed, available_thu, available_fri, available_sat]);

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
          <Text
            style={{
              color: value ? "white" : textColor, // White text for true, text color for false
            }}
          >
            {key.toUpperCase()}
          </Text>
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
