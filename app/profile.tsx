import React, { useState, useEffect } from "react";
import { Button, View, Alert } from "react-native"; // Keep Button for specific cases
import { fetchUserProfile, updateUserProfile } from "@/api/userService";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import ProfileImage from "@/components/ui/ProfileImage";
import FormWrapper from "@/components/ui/FormWrapper";

export default function ProfileScreen() {
  const { userId, setUserId } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImage: "https://via.placeholder.com/150",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;
      const userProfile = await fetchUserProfile(Number(userId));
      if (userProfile) {
        setForm({
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          profileImage:
            userProfile.profileImage || "https://via.placeholder.com/150",
        });
      }
    };

    loadUserProfile();
  }, [userId]);

  const handleUpdate = async () => {
    if (isEditing) {
      let hasError = false;
      setFirstNameError("");
      setLastNameError("");
      setEmailError("");
      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setEmailError("Please enter a valid email address.");
        hasError = true;
      }
      if (!form.firstName.trim()) {
        setFirstNameError("First name cannot be empty.");
        hasError = true;
      }
      if (!form.lastName.trim()) {
        setLastNameError("Last name cannot be empty.");
        hasError = true;
      }
      if (hasError) return;
      try {
        const formData = new FormData();
        formData.append("firstName", form.firstName);
        formData.append("lastName", form.lastName);
        formData.append("email", form.email);

        if (!form.profileImage.startsWith("http")) {
          const imageFile = {
            uri: form.profileImage,
            name: "profile.jpg",
            type: "image/jpeg",
          };
          formData.append("profileImage", imageFile as any);
        }

        console.log("Sending formData:", formData);

        const updatedProfile = await updateUserProfile(
          Number(userId),
          formData
        );
        if (updatedProfile) {
          setForm(updatedProfile);
          console.log("Profile updated successfully:", updatedProfile);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleImageChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setForm({ ...form, profileImage: result.assets[0].uri });
    }
  };

  const handlePasswordUpdate = async () => {
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmNewPasswordError("");
    let hasError = false;
    if (!currentPassword) {
      setCurrentPasswordError("Current password is required.");
      hasError = true;
    }
    if (!newPassword) {
      setNewPasswordError("New password is required.");
      hasError = true;
    }
    if (!confirmNewPassword) {
      setConfirmNewPasswordError("Please confirm your new password.");
      hasError = true;
    }
    if (
      newPassword &&
      confirmNewPassword &&
      newPassword !== confirmNewPassword
    ) {
      setNewPasswordError("Passwords do not match.");
      setConfirmNewPasswordError("Passwords do not match.");
      hasError = true;
    }
    if (hasError) return;
    try {
      const { updateUserPassword } = await import("@/api/userService");
      await updateUserPassword(Number(userId), currentPassword, newPassword);
      Alert.alert(
        "Password Updated",
        "Your password has been updated successfully."
      );
      setShowPasswordFields(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      if (error.message === "Current password is incorrect.") {
        setCurrentPasswordError("Current password is incorrect.");
      } else {
        Alert.alert(
          "Error",
          error.message || "Failed to update password. Please try again."
        );
      }
    }
  };

  return (
    <>
      <FormWrapper>
        {/* Profile Image */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <ProfileImage uri={form.profileImage} size={200} />
        </View>
        {isEditing && (
          <CustomButton
            title="Change Profile Image"
            onPress={handleImageChange}
            color="#007AFF"
          />
        )}
        {/* First Name Field */}
        <CustomInput
          placeholder="First Name"
          value={form.firstName}
          onChangeText={(text: string) => setForm({ ...form, firstName: text })}
          editable={isEditing}
          error={firstNameError}
        />
        {/* Last Name Field */}
        <CustomInput
          placeholder="Last Name"
          value={form.lastName}
          onChangeText={(text: string) => setForm({ ...form, lastName: text })}
          editable={isEditing}
          error={lastNameError}
        />
        {/* Email Field */}
        <CustomInput
          placeholder="Email"
          value={form.email}
          onChangeText={(text: string) => setForm({ ...form, email: text })}
          editable={isEditing}
          keyboardType="email-address"
          error={emailError}
        />
        {/* Update Profile Button */}
        <CustomButton
          title={isEditing ? "Save Profile" : "Update Profile"}
          onPress={handleUpdate}
          color="#007AFF"
        />
        {/* Cancel Edit Button: always visible when editing, even if password fields are shown */}
        {isEditing && (
          <CustomButton
            title="Cancel Profile Update"
            onPress={() => {
              setIsEditing(false);
              setFirstNameError("");
              setLastNameError("");
              setEmailError("");
              setShowPasswordFields(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmNewPassword("");
              setCurrentPasswordError("");
              setNewPasswordError("");
              setConfirmNewPasswordError("");
              // Optionally reset form to original values by reloading profile
              if (userId) {
                fetchUserProfile(Number(userId)).then((userProfile) => {
                  if (userProfile) {
                    setForm({
                      firstName: userProfile.firstName,
                      lastName: userProfile.lastName,
                      email: userProfile.email,
                      profileImage:
                        userProfile.profileImage ||
                        "https://via.placeholder.com/150",
                    });
                  }
                });
              }
            }}
            color="#888"
          />
        )}
        {/* Update Password Button */}
        {isEditing && !showPasswordFields && (
          <CustomButton
            title="Update Password"
            onPress={() => setShowPasswordFields(true)}
            color="#FF5733"
          />
        )}
        {isEditing && showPasswordFields && (
          <>
            <CustomInput
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              error={currentPasswordError}
            />
            <CustomInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              error={newPasswordError}
            />
            <CustomInput
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              error={confirmNewPasswordError}
            />
            <CustomButton
              title="Save Password"
              onPress={handlePasswordUpdate}
              color="#007AFF"
            />
            <CustomButton
              title="Cancel Password Update"
              onPress={() => {
                setShowPasswordFields(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setCurrentPasswordError("");
                setNewPasswordError("");
                setConfirmNewPasswordError("");
              }}
              color="#888"
            />
          </>
        )}
      </FormWrapper>
      <View style={{ marginTop: 32, alignItems: "center" }}>
        <CustomButton
          title="Sign Out"
          color="#FF3B30"
          onPress={() => {
            setUserId(null);
          }}
        />
      </View>
    </>
  );
}
