import React from "react";
import { TextInput, StyleSheet, View, Text } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

interface CustomInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  error?: string;
  [key: string]: any;
}

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  editable = true,
  error,
  ...props
}: CustomInputProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={{ width: "100%" }}>
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
            borderColor: error ? "#FF3B30" : "#ccc",
          },
        ]}
        {...props}
      />
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
