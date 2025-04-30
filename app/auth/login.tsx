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
        console.log("Login API response:", data); // Log the API response
        if (data.user_id) {
          await AsyncStorage.setItem("userId", data.user_id); // Save userId to storage
          setUserId(data.user_id); // Store user_id in AuthContext
        } else {
          console.warn("Login response does not contain user_id");
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
