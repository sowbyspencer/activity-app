import React, { useState } from "react";
import { ScrollView, Image } from "react-native"; // Keep ScrollView for horizontal image scrolling
import * as ImagePicker from "expo-image-picker";
import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import AvailabilitySelector from "@/components/ui/AvailabilitySelector";
import FormWrapper from "@/components/ui/FormWrapper";
import { API_URL } from "@/api/config";

export default function CreateActivityScreen() {
  const [form, setForm] = useState({
    name: "",
    location: "",
    has_cost: false,
    cost: "",
    url: "",
    description: "",
    images: [],
    availability: {
      sun: false,
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
    },
  });

  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_URL}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        alert("Activity created successfully!");
      } else {
        alert("Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri],
      }));
    }
  };

  const toggleAvailability = (day) => {
    setForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: !prev.availability[day],
      },
    }));
  };

  return (
    <FormWrapper>
      <CustomInput
        placeholder="Name"
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />
      <CustomInput
        placeholder="Location"
        value={form.location}
        onChangeText={(text) => setForm({ ...form, location: text })}
      />
      <CustomInput
        placeholder="Cost"
        value={form.cost}
        onChangeText={(text) => setForm({ ...form, cost: text })}
      />
      <CustomInput
        placeholder="URL"
        value={form.url}
        onChangeText={(text) => setForm({ ...form, url: text })}
      />
      <CustomInput
        placeholder="Description"
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
      />

      {/* Image Picker */}
      <CustomButton title="Add Images" onPress={pickImage} />
      <ScrollView horizontal style={{ marginBottom: 10 }}>
        {form.images.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={{
              width: 100,
              height: 100,
              marginRight: 10,
              borderRadius: 5,
            }}
          />
        ))}
      </ScrollView>

      {/* Availability Selector */}
      <AvailabilitySelector
        availability={form.availability}
        onToggle={toggleAvailability}
      />

      <CustomButton title="Create Activity" onPress={handleCreate} />
    </FormWrapper>
  );
}
