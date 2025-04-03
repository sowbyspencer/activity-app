import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { API_URL } from "@/api/config";

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const handleSignup = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        Alert.alert("Signup successful!");
      } else {
        Alert.alert("Signup failed", (await response.json()).error);
      }
    } catch (error) {
      console.error("Error during signup:", error);
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
      <TextInput
        placeholder="First Name"
        value={form.first_name}
        onChangeText={(text) => setForm({ ...form, first_name: text })}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        placeholder="Last Name"
        value={form.last_name}
        onChangeText={(text) => setForm({ ...form, last_name: text })}
        style={{ marginBottom: 10 }}
      />
      <Button title="Sign Up" onPress={handleSignup} />
    </View>
  );
}
