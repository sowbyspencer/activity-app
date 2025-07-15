import React, { useState } from "react";
import { API_URL } from "@/api/config";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import ActivityForm from "@/components/ActivityForm";
import { View, Text, ActivityIndicator } from "react-native";
import { useLocationContext } from "@/context/LocationContext";

export default function CreateActivityScreen() {
  const navigation = useNavigation();
  const { userId } = useAuth();
  const [processing, setProcessing] = useState(false);
  const { coords } = useLocationContext(); // Use shared location context

  const handleCreate = async (form: {
    name: string;
    location: string;
    has_cost: boolean;
    cost: string;
    url: string;
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
      setProcessing(true);
      const formData = new FormData();
      console.log("[FRONTEND] Creating activity with form:", form);
      formData.append("name", form.name);
      formData.append("location", form.location);
      formData.append("has_cost", form.has_cost ? "true" : "false");

      // Normalize cost: convert 'Free', 'none', or blank to empty string
      let cost = form.cost;
      if (/^(free|none)$/i.test(cost.trim()) || cost.trim() === "") cost = "";
      formData.append("cost", cost);

      formData.append("url", form.url);
      formData.append("description", form.description);
      formData.append("user_id", String(userId));

      // Append availability fields
      formData.append("available_sun", String(form.available_sun));
      formData.append("available_mon", String(form.available_mon));
      formData.append("available_tue", String(form.available_tue));
      formData.append("available_wed", String(form.available_wed));
      formData.append("available_thu", String(form.available_thu));
      formData.append("available_fri", String(form.available_fri));
      formData.append("available_sat", String(form.available_sat));

      // Add latitude and longitude if available
      console.log("[FRONTEND] Device coords:", coords);
      if (coords && coords.latitude && coords.longitude) {
        formData.append("lat", String(coords.latitude));
        formData.append("lon", String(coords.longitude));
      } else {
        console.warn("[FRONTEND] No device coords available, lat/lon will be null");
      }

      form.images.forEach((imageUri: string, index: number) => {
        const imageFile = {
          uri: imageUri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        };
        console.log(`[FRONTEND] Adding image to FormData:`, imageFile);

        // Correctly append the image file to FormData
        formData.append("images", {
          uri: imageFile.uri,
          type: imageFile.type,
          name: imageFile.name,
        } as any);
      });

      console.log("[FRONTEND] Submitting FormData to backend...");
      const response = await fetch(`${API_URL}/activities`, {
        method: "POST",
        body: formData,
      });
      setProcessing(false);
      if (response.ok) {
        const result = await response.json();
        console.log("[FRONTEND] Activity created successfully:", result);
        alert("Activity created successfully!");
        navigation.goBack();
      } else {
        const errorData = await response.json();
        console.error("[FRONTEND] Failed to create activity:", errorData);
        alert(`Failed to create activity: ${errorData.error}`);
      }
    } catch (error) {
      setProcessing(false);
      console.error("[FRONTEND] Error in handleCreate:", error);
    }
  };

  return (
    <>
      {processing && (
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
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginTop: 16,
            }}
          >
            Creating Activity...
          </Text>
        </View>
      )}
      <ActivityForm onSubmit={handleCreate} />
    </>
  );
}
