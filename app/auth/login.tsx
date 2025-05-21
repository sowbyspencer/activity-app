import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { API_URL } from "@/api/config";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { setUserId } = useAuth(); // Access setUserId from AuthContext
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
        console.log("Login response data:", data); // Log the full response
        setUserId(data.user_id); // Use the correct property from your API
        Alert.alert("Login successful!", "Navigating to the main app.");
        router.push("/(tabs)");
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
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: colorScheme === "dark" ? "#121212" : "#ffffff",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          color: colorScheme === "dark" ? "#ffffff" : "#000000",
        }}
      >
        Login
      </Text>
      <View style={{ width: 300 }}>
        <CustomInput
          placeholder="Email"
          value={form.email}
          onChangeText={(text: string) => setForm({ ...form, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colorScheme === "dark" ? "#888" : "#888",
            borderRadius: 8,
            padding: 10,
            color: colorScheme === "dark" ? "#fff" : "#000",
          }}
        />
        <CustomInput
          placeholder="Password"
          value={form.password}
          onChangeText={(text: string) => setForm({ ...form, password: text })}
          secureTextEntry
          style={{
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colorScheme === "dark" ? "#888" : "#888",
            borderRadius: 8,
            padding: 10,
            color: colorScheme === "dark" ? "#fff" : "#000",
          }}
        />
        <CustomButton title="Log In" onPress={handleLogin} color="#007AFF" />
        <CustomButton
          title="Don't have an account? Sign Up"
          onPress={() => router.push("/auth/signup")}
          color="#34C759"
        />
      </View>
    </View>
  );
}
