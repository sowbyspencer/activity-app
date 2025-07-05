import React, { useState, useRef } from "react";
import { View, Text, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import CustomPasswordInput from "@/components/ui/CustomPasswordInput";
import { useColorScheme } from "@/hooks/useColorScheme";
import { API_URL } from "@/api/config";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [profileImageError, setProfileImageError] = useState("");

  // Refs for input focus
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setProfileImageError("");
    }
  };

  const handleSignup = async () => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setFirstNameError("");
    setLastNameError("");
    setProfileImageError("");
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
    if (!profileImage) {
      setProfileImageError("Profile image is required");
      hasError = true;
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
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
          profile_image: profileImage,
        }),
      });
      const text = await response.text();
      console.log("Signup response:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        Alert.alert("Signup failed", "Unexpected server response. Please try again later.");
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          padding: 20,
          paddingTop: 40,
          backgroundColor: colorScheme === "dark" ? "#121212" : "#ffffff",
        }}
        keyboardShouldPersistTaps="handled"
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
            ref={emailRef}
            placeholder="Email"
            value={form.email}
            onChangeText={(text: string) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
          />
          <CustomPasswordInput
            ref={passwordRef}
            placeholder="Password"
            value={form.password}
            onChangeText={(text: string) => setForm({ ...form, password: text })}
            error={passwordError}
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current && confirmPasswordRef.current.focus()}
          />
          <CustomPasswordInput
            ref={confirmPasswordRef}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChangeText={(text: string) => setForm({ ...form, confirmPassword: text })}
            error={confirmPasswordError}
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => firstNameRef.current && firstNameRef.current.focus()}
          />
          <CustomInput
            ref={firstNameRef}
            placeholder="First Name"
            value={form.first_name}
            onChangeText={(text: string) => setForm({ ...form, first_name: text })}
            error={firstNameError}
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current && lastNameRef.current.focus()}
          />
          <CustomInput
            ref={lastNameRef}
            placeholder="Last Name"
            value={form.last_name}
            onChangeText={(text: string) => setForm({ ...form, last_name: text })}
            error={lastNameError}
            returnKeyType="done"
            onSubmitEditing={() => {}}
          />
          {/* Profile Image Picker */}
          <CustomButton title={profileImage ? "Change Profile Image" : "Pick Profile Image"} onPress={handlePickImage} color="#007AFF" />
          {profileImage ? (
            <View style={{ alignItems: "center", marginVertical: 10 }}>
              <Image source={{ uri: profileImage }} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 6 }} />
              <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>Image selected</Text>
            </View>
          ) : null}
          {profileImageError ? <Text style={{ color: "#B00020", marginBottom: 10 }}>{profileImageError}</Text> : null}
          <CustomButton title="Sign Up" onPress={handleSignup} color="#34C759" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
