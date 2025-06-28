import React from "react";
import { API_URL } from "@/api/config";
import { useNavigation, useRoute } from "@react-navigation/native";
import ActivityForm from "@/components/ActivityForm";

export default function EditActivityScreen() {
  const navigation = useNavigation();
  const route = useRoute();
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
      formData.append("name", form.name);
      formData.append("location", form.location);
      formData.append("has_cost", form.has_cost ? "true" : "false");
      formData.append("cost", form.cost ?? "");
      formData.append("url", form.url ?? "");
      formData.append("description", form.description);

      // Append availability fields
      formData.append("available_sun", form.available_sun ? "true" : "false");
      formData.append("available_mon", form.available_mon ? "true" : "false");
      formData.append("available_tue", form.available_tue ? "true" : "false");
      formData.append("available_wed", form.available_wed ? "true" : "false");
      formData.append("available_thu", form.available_thu ? "true" : "false");
      formData.append("available_fri", form.available_fri ? "true" : "false");
      formData.append("available_sat", form.available_sat ? "true" : "false");

      form.images.forEach((imageUri: string, index: number) => {
        const imageFile = {
          uri: imageUri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        };

        formData.append("images", {
          uri: imageFile.uri,
          type: imageFile.type,
          name: imageFile.name,
        } as any);
      });

      formData.append("user_id", activity.user_id || "1"); // Default to 1 if undefined

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
