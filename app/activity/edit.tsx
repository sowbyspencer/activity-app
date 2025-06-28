import React from "react";
import { API_URL } from "@/api/config";
import { useNavigation, useRoute } from "@react-navigation/native";
import ActivityForm from "@/components/ActivityForm";

export default function EditActivityScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { activity } = route.params; // Assume activity data is passed as route params

  const handleEdit = async (form: {
    name: string;
    location: string;
    has_cost: boolean;
    cost: string;
    url: string;
    description: string;
    images: string[];
    availability: {
      sun: boolean;
      mon: boolean;
      tue: boolean;
      wed: boolean;
      thu: boolean;
      fri: boolean;
      sat: boolean;
    };
  }) => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("location", form.location);
      formData.append("has_cost", form.has_cost ? "true" : "false");
      formData.append("cost", form.cost === "" ? "" : form.cost);
      formData.append("url", form.url);
      formData.append("description", form.description);

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
        });
      });

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

  return <ActivityForm initialData={activity} onSubmit={handleEdit} />;
}
