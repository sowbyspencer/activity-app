import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { API_URL } from "@/api/config";
import { useRouter } from "expo-router";

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  const handleSignup = async () => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setFirstNameError("");
    setLastNameError("");
    let hasError = false;
    let errorMessages: string[] = [];
    if (!form.email) {
      setEmailError("Email is required");
      hasError = true;
    }
    if (!form.password) {
      setPasswordError("Password is required");
      hasError = true;
    }
    if (!form.confirmPassword) {
      setConfirmPasswordError("Confirm Password is required");
      hasError = true;
    }
    if (!form.first_name) {
      setFirstNameError("First Name is required");
      hasError = true;
    }
    if (!form.last_name) {
      setLastNameError("Last Name is required");
      hasError = true;
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }
    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      setPasswordError("Passwords do not match");
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    }
    if (hasError) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
        }),
      });
      const text = await response.text();
      console.log("Signup response:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        Alert.alert(
          "Signup failed",
          "Unexpected server response. Please try again later."
        );
        return;
      }
      if (response.ok) {
        Alert.alert("Signup successful!", "You can now log in.", [
          {
            text: "OK",
            onPress: () => router.replace("/auth/login"),
          },
        ]);
      } else {
        Alert.alert("Signup failed", data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 20,
        paddingTop: 40,
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
        Sign Up
      </Text>
      <View style={{ width: 300 }}>
        <CustomInput
          placeholder="Email"
          value={form.email}
          onChangeText={(text: string) => setForm({ ...form, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          error={emailError}
        />
        <CustomInput
          placeholder="Password"
          value={form.password}
          onChangeText={(text: string) => setForm({ ...form, password: text })}
          secureTextEntry
          error={passwordError}
        />
        <CustomInput
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(text: string) =>
            setForm({ ...form, confirmPassword: text })
          }
          secureTextEntry
          error={confirmPasswordError}
        />
        <CustomInput
          placeholder="First Name"
          value={form.first_name}
          onChangeText={(text: string) =>
            setForm({ ...form, first_name: text })
          }
          error={firstNameError}
        />
        <CustomInput
          placeholder="Last Name"
          value={form.last_name}
          onChangeText={(text: string) => setForm({ ...form, last_name: text })}
          error={lastNameError}
        />
        <CustomButton title="Sign Up" onPress={handleSignup} color="#007AFF" />
      </View>
    </View>
  );
}
