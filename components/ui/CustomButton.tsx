import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function CustomButton({ title, onPress, color, ...props }) {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor:
            color || (colorScheme === "dark" ? "#444" : "#007BFF"),
        },
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
