// -----------------------------------------------------------------------------
// CustomInput.tsx - Reusable text input with error display
// -----------------------------------------------------------------------------
// Provides a styled text input with error message support for forms.
// Used throughout the app for consistent input UI and validation feedback.
//
// Props:
//   - All TextInput props
//   - error: error message to display below input
// -----------------------------------------------------------------------------

import React, { forwardRef } from "react";
import { TextInput, StyleSheet, View, Text, TextInputProps } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

interface CustomInputProps extends TextInputProps {
  error?: string; // Optional error message to display below input
}

// CustomInput: A styled text input with error display for forms
const CustomInput = forwardRef<TextInput, CustomInputProps>(({ placeholder, value, onChangeText, editable = true, error, ...props }, ref) => {
  const colorScheme = useColorScheme();

  return (
    <View style={{ width: "100%" }}>
      <TextInput
        ref={ref}
        placeholder={placeholder}
        placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        style={[
          styles.input,
          {
            color: colorScheme === "dark" ? "white" : "black", // Text color by theme
            backgroundColor: colorScheme === "dark" ? "#222" : "#f9f9f9", // BG color by theme
            borderColor: error ? "#FF3B30" : "#ccc", // Red border if error
          },
        ]}
        {...props}
      />
      {/* Show error message below input if present */}
      {error ? (
        <Text
          style={{
            color: "#FF3B30",
            marginTop: -10,
            marginBottom: 10,
            marginLeft: 5,
            fontSize: 13,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
});

CustomInput.displayName = "CustomInput";

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

export default CustomInput;
