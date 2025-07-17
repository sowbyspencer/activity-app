// -----------------------------------------------------------------------------
// CustomButton.tsx - Reusable button component for forms and actions
// -----------------------------------------------------------------------------
// Provides a styled button with color, opacity, and disabled state support.
// Used throughout the app for consistent button UI.
//
// Props:
//   - title: button label
//   - onPress: callback when pressed
//   - color: background color
//   - disabled: disables button and lowers opacity
//   - opacity: override for button opacity
// -----------------------------------------------------------------------------

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

interface CustomButtonProps {
  title: string; // Button label text
  onPress: () => void; // Callback when button is pressed
  color?: string; // Optional background color
  disabled?: boolean; // If true, disables button and lowers opacity
  style?: any; // Optional style override
  opacity?: number; // Optional override for button opacity
}

// CustomButton: A styled button for forms and actions
export default function CustomButton({ title, onPress, color, disabled, style, opacity, ...props }: CustomButtonProps) {
  const colorScheme = useColorScheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: color || (colorScheme === "dark" ? "#444" : "#007BFF"), // Use provided color or theme default
          opacity: typeof opacity === "number" ? opacity : disabled ? 0.5 : 1, // Lower opacity if disabled
        },
        style,
      ]}
      {...props}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
});
