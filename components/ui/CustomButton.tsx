import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: any;
  opacity?: number;
}

export default function CustomButton({ title, onPress, color, disabled, style, opacity, ...props }: CustomButtonProps) {
  const colorScheme = useColorScheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: color || (colorScheme === "dark" ? "#444" : "#007BFF"),
          opacity: typeof opacity === "number" ? opacity : disabled ? 0.5 : 1,
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
