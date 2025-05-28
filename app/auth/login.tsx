import React, { useState, useEffect } from "react";
import { View, Text, Alert, BackHandler, Platform } from "react-native";
import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import CustomPasswordInput from "@/components/ui/CustomPasswordInput";
import { useColorScheme } from "@/hooks/useColorScheme";
import { API_URL } from "@/api/config";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { setUserId } = useAuth(); // Access setUserId from AuthContext
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === "android") {
        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            // Exit the app if on the login screen
            BackHandler.exitApp();
            return true;
          }
        );
        return () => backHandler.remove();
      }
    }, [])
  );

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
        />
        <CustomPasswordInput
          placeholder="Password"
          value={form.password}
          onChangeText={(text: string) => setForm({ ...form, password: text })}
          autoCapitalize="none"
          style={{ marginBottom: 20 }}
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
