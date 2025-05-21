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
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const highlightField = (field: string) => invalidFields.includes(field);

  const handleSignup = async () => {
    const newInvalidFields: string[] = [];
    let errorMessages: string[] = [];
    if (!form.email) {
      newInvalidFields.push("email");
      errorMessages.push("Email is required");
    }
    if (!form.password) {
      newInvalidFields.push("password");
      errorMessages.push("Password is required");
    }
    if (!form.confirmPassword) {
      newInvalidFields.push("confirmPassword");
      errorMessages.push("Confirm Password is required");
    }
    if (!form.first_name) {
      newInvalidFields.push("first_name");
      errorMessages.push("First Name is required");
    }
    if (!form.last_name) {
      newInvalidFields.push("last_name");
      errorMessages.push("Last Name is required");
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      if (!newInvalidFields.includes("email")) newInvalidFields.push("email");
      errorMessages.push("Please enter a valid email address");
    }
    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      if (!newInvalidFields.includes("password"))
        newInvalidFields.push("password");
      if (!newInvalidFields.includes("confirmPassword"))
        newInvalidFields.push("confirmPassword");
      errorMessages.push("Passwords do not match");
    }
    if (newInvalidFields.length > 0) {
      setInvalidFields(newInvalidFields);
      setTimeout(() => setInvalidFields([]), 1200);
      Alert.alert("Signup Error", errorMessages.join("\n"));
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
          style={{
            marginBottom: 10,
            borderWidth: 1.5,
            borderColor: highlightField("email") ? "#FF3B30" : "#888",
            borderRadius: 8,
            padding: 10,
            color: colorScheme === "dark" ? "#fff" : "#000",
            backgroundColor: highlightField("email") ? "#ffeaea" : undefined,
          }}
        />
        <CustomInput
          placeholder="Password"
          value={form.password}
          onChangeText={(text: string) => setForm({ ...form, password: text })}
          secureTextEntry
          style={{
            marginBottom: 10,
            borderWidth: 1.5,
            borderColor: highlightField("password") ? "#FF3B30" : "#888",
            borderRadius: 8,
            padding: 10,
            color: colorScheme === "dark" ? "#fff" : "#000",
            backgroundColor: highlightField("password") ? "#ffeaea" : undefined,
          }}
        />
        <CustomInput
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(text: string) =>
            setForm({ ...form, confirmPassword: text })
          }
          secureTextEntry
          style={{
            marginBottom: 10,
            borderWidth: 1.5,
            borderColor: highlightField("confirmPassword") ? "#FF3B30" : "#888",
            borderRadius: 8,
            padding: 10,
            color: colorScheme === "dark" ? "#fff" : "#000",
            backgroundColor: highlightField("confirmPassword")
              ? "#ffeaea"
              : undefined,
          }}
        />
        <CustomInput
          placeholder="First Name"
          value={form.first_name}
          onChangeText={(text: string) =>
            setForm({ ...form, first_name: text })
          }
          style={{
            marginBottom: 10,
            borderWidth: 1.5,
            borderColor: highlightField("first_name") ? "#FF3B30" : "#888",
            borderRadius: 8,
            padding: 10,
            color: colorScheme === "dark" ? "#fff" : "#000",
            backgroundColor: highlightField("first_name")
              ? "#ffeaea"
              : undefined,
          }}
        />
        <CustomInput
          placeholder="Last Name"
          value={form.last_name}
          onChangeText={(text: string) => setForm({ ...form, last_name: text })}
          style={{
            marginBottom: 20,
            borderWidth: 1.5,
            borderColor: highlightField("last_name") ? "#FF3B30" : "#888",
            borderRadius: 8,
            padding: 10,
            color: colorScheme === "dark" ? "#fff" : "#000",
            backgroundColor: highlightField("last_name")
              ? "#ffeaea"
              : undefined,
          }}
        />
        <CustomButton title="Sign Up" onPress={handleSignup} color="#007AFF" />
      </View>
    </View>
  );
}
