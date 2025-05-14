// Move this file to app/index.tsx to make it the default entry point.
import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { API_URL } from "@/api/config";
import { AuthContext } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const { setUserId } = useContext(AuthContext);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("[LOGIN] API response data:", data); // Log the API response
        // Accept both user_id (number) and userId (string) from API
        const userId =
          data.user_id?.toString() ||
          data.userId?.toString() ||
          data.id?.toString();
        console.log("[LOGIN] Extracted userId:", userId); // Log the extracted userId
        if (userId) {
          await AsyncStorage.setItem("userId", userId); // Save userId to storage
          setUserId(userId); // Store userId in AuthContext
        } else {
          console.warn(
            "[LOGIN] Login response does not contain user_id or userId"
          );
        }
        Alert.alert("Login successful!", `Token: ${data.token}`);
      } else {
        Alert.alert("Login failed", (await response.json()).error);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <View
      style={{
        padding: 20,
        backgroundColor: colorScheme === "dark" ? "black" : "white",
      }}
    >
      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
        secureTextEntry
        style={{ marginBottom: 10 }}
      />
      <Button title="Log In" onPress={handleLogin} />
    </View>
  );
}
