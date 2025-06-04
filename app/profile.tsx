import React, { useState, useEffect } from "react";
import { Button, View, Alert, Modal, Text, TextInput, StyleSheet } from "react-native"; // Add Modal, Text, TextInput, StyleSheet
import { fetchUserProfile, updateUserProfile } from "@/api/userService";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import ProfileImage from "@/components/ui/ProfileImage";
import FormWrapper from "@/components/ui/FormWrapper";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CustomPasswordInput from "@/components/ui/CustomPasswordInput";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const { userId, setUserId } = useAuth();
  const router = useRouter();
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePasswordError, setDeletePasswordError] = useState("");
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;
      const userProfile = await fetchUserProfile(Number(userId));
      if (userProfile) {
        setForm({
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          profileImage: userProfile.profileImage || "https://via.placeholder.com/150",
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

        if (form.profileImage && !form.profileImage.startsWith("http")) {
          const imageFile = {
            uri: form.profileImage,
            name: "profile.jpg",
            type: "image/jpeg",
          };
          formData.append("profileImage", imageFile as any);
        }

        console.log("Sending formData:", formData);

        const updatedProfile = await updateUserProfile(Number(userId), formData);
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
    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      setNewPasswordError("Passwords do not match.");
      setConfirmNewPasswordError("Passwords do not match.");
      hasError = true;
    }
    if (hasError) return;
    try {
      const { updateUserPassword } = await import("@/api/userService");
      await updateUserPassword(Number(userId), currentPassword, newPassword);
      Alert.alert("Password Updated", "Your password has been updated successfully.");
      setShowPasswordFields(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      if (error.message === "Current password is incorrect.") {
        setCurrentPasswordError("Current password is incorrect.");
      } else {
        Alert.alert("Error", error.message || "Failed to update password. Please try again.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    setDeletePasswordError("");
    if (!deletePassword) {
      setDeletePasswordError("Password is required.");
      return;
    }
    // Try password validation before showing final prompt
    try {
      const { deleteUserAccount } = await import("@/api/userService");
      // Call backend with a test flag to only validate password
      await deleteUserAccount(Number(userId), deletePassword, true); // true = validate only
      setShowDeleteModal(false);
      setShowFinalDeleteConfirm(true);
    } catch (error: any) {
      setDeletePasswordError(error.message || "Incorrect password.");
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      const { deleteUserAccount } = await import("@/api/userService");
      await deleteUserAccount(Number(userId), deletePassword);
      Alert.alert("Account Deleted", "Your account has been deleted.");
      setUserId(null);
      router.replace("/auth/login");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete account. Please try again.");
    } finally {
      setShowFinalDeleteConfirm(false);
      setDeletePassword("");
    }
  };

  return (
    <>
      <FormWrapper>
        {/* Profile Image */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <ProfileImage uri={form.profileImage} size={200} />
        </View>
        {isEditing && <CustomButton title="Change Profile Image" onPress={handleImageChange} color="#007AFF" />}
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
        <CustomButton title={isEditing ? "Save Profile" : "Update Profile"} onPress={handleUpdate} color="#007AFF" />
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
                      profileImage: userProfile.profileImage || "https://via.placeholder.com/150",
                    });
                  }
                });
              }
            }}
            color="#888"
          />
        )}
        {/* Update Password Button */}
        {isEditing && !showPasswordFields && <CustomButton title="Update Password" onPress={() => setShowPasswordFields(true)} color="#FF5733" />}
        {isEditing && showPasswordFields && (
          <>
            <CustomPasswordInput
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              error={currentPasswordError}
              autoCapitalize="none"
            />
            <CustomPasswordInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              error={newPasswordError}
              autoCapitalize="none"
            />
            <CustomPasswordInput
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              error={confirmNewPasswordError}
              autoCapitalize="none"
            />
            <CustomButton title="Save Password" onPress={handlePasswordUpdate} color="#007AFF" />
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
          onPress={async () => {
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                  try {
                    await setUserId(null); // Ensure AsyncStorage is cleared
                    const storedUserId = await AsyncStorage.getItem("userId");
                    console.log("[SignOut] AsyncStorage userId after sign out:", storedUserId);
                    if (storedUserId !== null) {
                      console.warn("[SignOut] userId was not cleared from AsyncStorage!");
                    }
                    router.replace("/auth/login");
                  } catch (err) {
                    console.error("[SignOut] Error during sign out:", err);
                    Alert.alert("Sign Out Error", "Failed to sign out. Please try again.");
                  }
                },
              },
            ]);
          }}
        />
      </View>
      <View style={{ marginTop: 64, alignItems: "center", marginBottom: 24 }}>
        <CustomButton
          title="Delete Account"
          color="#B00020"
          onPress={() => {
            Alert.alert("Delete Account", "You will confirm deletion with a password. Are you sure you want to delete your account?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Continue",
                style: "destructive",
                onPress: () => setShowDeleteModal(true),
              },
            ]);
          }}
        />
      </View>
      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="slide" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>Confirm Account Deletion</Text>
            <Text style={{ marginBottom: 12 }}>Please enter your password to confirm account deletion.</Text>
            <CustomPasswordInput
              placeholder="Password"
              value={deletePassword}
              onChangeText={setDeletePassword}
              error={deletePasswordError}
              autoCapitalize="none"
              style={styles.input}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Button
                title="Cancel"
                color="#888"
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeletePasswordError("");
                }}
              />
              <Button title="Continue" color="#B00020" onPress={handleDeleteAccount} />
            </View>
          </View>
        </View>
      </Modal>
      {/* Final Delete Confirmation Modal */}
      <Modal visible={showFinalDeleteConfirm} transparent animationType="fade" onRequestClose={() => setShowFinalDeleteConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>Are you absolutely sure?</Text>
            <Text style={{ marginBottom: 16 }}>This action cannot be undone. Your account and all associated data will be permanently deleted.</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Button title="Cancel" color="#888" onPress={() => setShowFinalDeleteConfirm(false)} />
              <Button title="Delete Account" color="#B00020" onPress={confirmDeleteAccount} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 24,
    width: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
});
