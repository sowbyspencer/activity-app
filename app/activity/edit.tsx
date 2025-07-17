import React, { useState } from "react";
import { API_URL } from "@/api/config";
import { useNavigation, useRoute } from "@react-navigation/native";
import ActivityForm from "@/components/ActivityForm";
import { useAuth } from "@/context/AuthContext";
import { Alert, View, Text, ActivityIndicator } from "react-native";
import CustomButton from "@/components/ui/CustomButton";

export default function EditActivityScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Removed useLocationContext and device coords
  // Type-safe access to route params
  const activity = route.params && typeof route.params === "object" && "activity" in route.params ? JSON.parse(route.params.activity as string) : {};

  const handleEdit = async (form: {
    name: string;
    has_cost: boolean;
    cost?: string | null;
    url?: string | null;
    description: string;
    images: string[];
    available_sun: boolean;
    available_mon: boolean;
    available_tue: boolean;
    available_wed: boolean;
    available_thu: boolean;
    available_fri: boolean;
    available_sat: boolean;
    address: string;
    latitude?: number;
    longitude?: number;
  }) => {
    try {
      setProcessing(true);
      const formData = new FormData();
      console.log("[FRONTEND] Editing activity with form:", form);
      // Only append fields that have changed
      if (form.name !== activity.name) formData.append("name", form.name);
      if (form.description !== activity.description) formData.append("description", form.description);
      if (form.has_cost !== activity.has_cost) formData.append("has_cost", form.has_cost ? "true" : "false");
      if (form.cost !== activity.cost) formData.append("cost", form.cost ?? "");
      if (form.url !== activity.url) formData.append("url", form.url ?? "");
      if (form.available_sun !== activity.available_sun) formData.append("available_sun", form.available_sun ? "true" : "false");
      if (form.available_mon !== activity.available_mon) formData.append("available_mon", form.available_mon ? "true" : "false");
      if (form.available_tue !== activity.available_tue) formData.append("available_tue", form.available_tue ? "true" : "false");
      if (form.available_wed !== activity.available_wed) formData.append("available_wed", form.available_wed ? "true" : "false");
      if (form.available_thu !== activity.available_thu) formData.append("available_thu", form.available_thu ? "true" : "false");
      if (form.available_fri !== activity.available_fri) formData.append("available_fri", form.available_fri ? "true" : "false");
      if (form.available_sat !== activity.available_sat) formData.append("available_sat", form.available_sat ? "true" : "false");
      formData.append("user_id", userId ? String(userId) : "");
      // Only append address/lat/lon if changed
      if (form.address !== activity.address) formData.append("address", form.address);
      if (form.latitude !== activity.latitude) formData.append("lat", String(form.latitude ?? ""));
      if (form.longitude !== activity.longitude) formData.append("lon", String(form.longitude ?? ""));
      // Handle images: only send new images as files, keep existing URLs as-is
      if (form.images && Array.isArray(form.images)) {
        form.images.forEach((img) => {
          if (img.startsWith("file://") || img.startsWith("content://")) {
            const imageFile = {
              uri: img,
              name: "activity-image.jpg",
              type: "image/jpeg",
            };
            console.log("[FRONTEND] Adding image to FormData:", imageFile);
            formData.append("images", imageFile as any);
          } else {
            console.log("[FRONTEND] Adding existing image URL to FormData:", img);
            formData.append("existingImages", img);
          }
        });
      }
      console.log("[FRONTEND] Submitting FormData to backend...");
      const response = await fetch(`${API_URL}/activities/${activity.id}`, {
        method: "PUT",
        body: formData,
      });
      setProcessing(false);
      if (response.ok) {
        const result = await response.json();
        console.log("[FRONTEND] Activity updated successfully:", result);
        alert("Activity updated successfully!");
        navigation.goBack();
      } else {
        const errorData = await response.json();
        console.error("[FRONTEND] Failed to update activity:", errorData);
        alert(`Failed to update activity: ${errorData.error}`);
      }
    } catch (error) {
      setProcessing(false);
      console.error("[FRONTEND] Error in handleEdit:", error);
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete Activity", "Are you sure you want to delete this activity? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            const response = await fetch(`${API_URL}/activities/${activity.id}`, {
              method: "DELETE",
            });
            setDeleting(false);
            if (response.ok) {
              alert("Activity deleted successfully!");
              navigation.goBack();
            } else {
              const errorData = await response.json();
              alert(`Failed to delete activity: ${errorData.error}`);
            }
          } catch (error) {
            setDeleting(false);
            alert("Error deleting activity. Please try again.");
          }
        },
      },
    ]);
  };

  const parsedActivity = {
    ...activity,
    available_sun: activity.available_sun === "true" || activity.available_sun === true || !!activity.available_sun,
    available_mon: activity.available_mon === "true" || activity.available_mon === true || !!activity.available_mon,
    available_tue: activity.available_tue === "true" || activity.available_tue === true || !!activity.available_tue,
    available_wed: activity.available_wed === "true" || activity.available_wed === true || !!activity.available_wed,
    available_thu: activity.available_thu === "true" || activity.available_thu === true || !!activity.available_thu,
    available_fri: activity.available_fri === "true" || activity.available_fri === true || !!activity.available_fri,
    available_sat: activity.available_sat === "true" || activity.available_sat === true || !!activity.available_sat,
    address: activity.address || "", // ensure address is passed to ActivityForm
  };

  return (
    <View style={{ flex: 1 }}>
      {(processing || deleting) && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            backgroundColor: "rgba(255,255,255,0.7)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#333" />
          <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 16 }}>{deleting ? "Deleting Activity..." : "Updating Activity..."}</Text>
        </View>
      )}
      <ActivityForm initialData={parsedActivity} onSubmit={handleEdit} />
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <CustomButton title="Delete Activity" onPress={handleDelete} color="#B00020" />
      </View>
    </View>
  );
}
