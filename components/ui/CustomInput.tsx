import React from "react";
import { TextInput, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  editable = true,
  ...props
}) {
  const colorScheme = useColorScheme();

  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      style={[
        styles.input,
        {
          color: colorScheme === "dark" ? "white" : "black",
          backgroundColor: colorScheme === "dark" ? "#222" : "#f9f9f9",
        },
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
});
