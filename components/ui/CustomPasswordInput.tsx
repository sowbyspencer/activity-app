import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";

interface CustomPasswordInputProps extends TextInputProps {
  error?: string;
}

const CustomPasswordInput: React.FC<CustomPasswordInputProps> = ({
  error,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={{ position: "relative", width: "100%" }}>
      <TextInput
        {...props}
        secureTextEntry={!showPassword}
        style={[
          styles.input,
          isDark ? styles.inputDark : styles.inputLight,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={isDark ? "#aaa" : "#888"}
      />
      <TouchableOpacity
        style={[styles.icon, { height: 50, justifyContent: "center" }]}
        onPress={() => setShowPassword((v) => !v)}
        accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={showPassword ? "eye-off" : "eye"}
          size={22}
          color={isDark ? "#aaa" : "#888"}
        />
      </TouchableOpacity>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15, // Ensure consistent spacing between fields
    fontSize: 16,
    backgroundColor: "#fff", // default, will be overridden for dark mode
  },
  inputLight: {
    borderColor: "#ccc",
    color: "#000",
    backgroundColor: "#f9f9f9",
  },
  inputDark: {
    borderColor: "#ccc",
    color: "#fff",
    backgroundColor: "#222",
  },
  inputError: {
    borderColor: "#B00020",
  },
  icon: {
    position: "absolute",
    right: 16,
    top: 0,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  errorText: {
    color: "#B00020",
    marginTop: 2,
    marginLeft: 4,
    fontSize: 13,
  },
});

export default CustomPasswordInput;
