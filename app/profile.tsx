import React, { useState, useEffect } from "react";
import { Button, View } from "react-native"; // Keep Button for specific cases
import { fetchUserProfile, updateUserProfile } from "@/api/userService";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import ProfileImage from "@/components/ui/ProfileImage";
import FormWrapper from "@/components/ui/FormWrapper";

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImage: "https://via.placeholder.com/150",
  });
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <FormWrapper>
      {/* Profile Image */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <ProfileImage uri={form.profileImage} size={200} />
      </View>
      {isEditing && (
        <CustomButton
          title="Change Profile Image"
          onPress={handleImageChange}
        />
      )}
      {/* First Name Field */}
      <CustomInput
        placeholder="First Name (Error)"
        value={form.firstName}
        onChangeText={(text) => setForm({ ...form, firstName: text })}
        editable={isEditing}
      />
      {/* Last Name Field */}
      <CustomInput
        placeholder="Last Name (Error)"
        value={form.lastName}
        onChangeText={(text) => setForm({ ...form, lastName: text })}
        editable={isEditing}
      />
      {/* Email Field */}
      <CustomInput
        placeholder="Email (Error)"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
        editable={isEditing}
        keyboardType="email-address"
      />
      {/* Update Profile Button */}
      <CustomButton
        title={isEditing ? "Save Profile" : "Update Profile"}
        onPress={handleUpdate}
      />
      {/* Update Password Button */}
      {isEditing && (
        <CustomButton
          title="Update Password"
          onPress={() => console.log("Update Password pressed")}
          color="#FF5733"
        />
      )}
    </FormWrapper>
  );
}
