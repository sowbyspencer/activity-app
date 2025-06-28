import React from "react";
import { API_URL } from "@/api/config";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import ActivityForm from "@/components/ActivityForm";

export default function CreateActivityScreen() {
  const navigation = useNavigation();
  const { userId } = useAuth();

  const handleCreate = async (form: {
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
      formData.append("user_id", String(userId));

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

      const response = await fetch(`${API_URL}/activities`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Activity created successfully!");
        navigation.goBack();
      } else {
        const errorData = await response.json();

        alert(`Failed to create activity: ${errorData.error}`);
      }
    } catch (error) {}
  };

  return <ActivityForm onSubmit={handleCreate} />;
}
