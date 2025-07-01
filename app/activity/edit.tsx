import React from "react";
import { API_URL } from "@/api/config";
import { useNavigation, useRoute } from "@react-navigation/native";
import ActivityForm from "@/components/ActivityForm";
import { useAuth } from "@/context/AuthContext";

export default function EditActivityScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = useAuth();
  const activity = JSON.parse(route.params.activity); // Parse activity data from route params

  //   console.log("[EditActivityScreen] Initializing with activity:", activity);

  const handleEdit = async (form: {
    name: string;
    location: string;
    has_cost: boolean;
    cost?: string | null; // Allow cost to be optional or null
    url?: string | null; // Allow url to be optional or null
    description: string;
    images: string[];
    available_sun: boolean;
    available_mon: boolean;
    available_tue: boolean;
    available_wed: boolean;
    available_thu: boolean;
    available_fri: boolean;
    available_sat: boolean;
  }) => {
    try {
      const formData = new FormData();
      // Only append fields that have changed
      if (form.name !== activity.name) formData.append("name", form.name);
      if (form.location !== activity.location) formData.append("location", form.location);
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
      // Always send user_id for now
      formData.append("user_id", userId ? String(userId) : ""); // Use real user id from AuthContext

      // Handle images: only send new images as files, keep existing URLs as-is
      if (form.images && Array.isArray(form.images)) {
        form.images.forEach((img) => {
          if (img.startsWith("file://") || img.startsWith("content://")) {
            // New image picked from device, send as file
            formData.append("images", {
              uri: img,
              name: "activity-image.jpg",
              type: "image/jpeg",
            });
          } else {
            // Existing image URL, send as string (backend should merge)
            formData.append("existingImages", img);
          }
        });
      }

      // Debug: log FormData contents
      for (let pair of formData.entries()) {
        console.log("[FRONTEND] FormData", pair[0], pair[1]);
      }
      // Log the images array being submitted
      console.log("[FRONTEND] Submitting images array:", form.images);

      const response = await fetch(`${API_URL}/activities/${activity.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        alert("Activity updated successfully!");
        navigation.goBack();
      } else {
        const errorData = await response.json();
        console.error("[FRONTEND] Error response from server:", errorData);
        alert(`Failed to update activity: ${errorData.error}`);
      }
    } catch (error) {
      console.error("[FRONTEND] Error updating activity:", error);
    }
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
  };

  return <ActivityForm initialData={parsedActivity} onSubmit={handleEdit} />;
}
