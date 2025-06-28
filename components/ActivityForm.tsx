import React, { useState } from "react";
import { ScrollView, Image, TouchableOpacity, View, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import AvailabilitySelector from "@/components/ui/AvailabilitySelector";
import FormWrapper from "@/components/ui/FormWrapper";

type ActivityFormProps = {
  initialData?: {
    name?: string;
    location?: string;
    has_cost?: boolean;
    cost?: string;
    url?: string;
    description?: string;
    images?: string[];
    availability?: {
      sun: boolean;
      mon: boolean;
      tue: boolean;
      wed: boolean;
      thu: boolean;
      fri: boolean;
      sat: boolean;
    };
  };
  onSubmit: (form: any) => Promise<void>;
};

export default function ActivityForm({ initialData, onSubmit }: ActivityFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    location: initialData?.location || "",
    has_cost: initialData?.has_cost || false,
    cost: initialData?.cost || "",
    url: initialData?.url || "",
    description: initialData?.description || "",
    images: initialData?.images || [],
    availability: initialData?.availability || {
      sun: false,
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
    },
  });

  const [showRemoveButtons, setShowRemoveButtons] = useState(false);

  const handleSubmit = async () => {
    try {
      await onSubmit(form);
    } catch (error) {
      console.error("Error submitting activity form:", error);
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

  const toggleAvailability = (day: keyof typeof form.availability) => {
    setForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: !prev.availability[day],
      },
    }));
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleLongPressImage = () => {
    setShowRemoveButtons((prev) => !prev);
  };

  const handleTapOutsideScrollView = () => {
    setShowRemoveButtons(false);
  };

  return (
    <FormWrapper>
      <CustomInput placeholder="Name" value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} />
      <CustomInput placeholder="Location" value={form.location} onChangeText={(text) => setForm({ ...form, location: text })} />
      <CustomInput placeholder="Cost" value={form.cost} onChangeText={(text) => setForm({ ...form, cost: text })} />
      <CustomInput placeholder="URL" value={form.url} onChangeText={(text) => setForm({ ...form, url: text })} />
      <CustomInput placeholder="Description" value={form.description} onChangeText={(text) => setForm({ ...form, description: text })} />

      <CustomButton title="Add Images" onPress={pickImage} color="#007AFF" />
      <ScrollView
        horizontal
        style={{ marginBottom: 10 }}
        onTouchStart={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          if (locationY < 0 || locationX < 0) {
            handleTapOutsideScrollView();
          }
        }}
      >
        {form.images.map((uri: string, index: number) => (
          <TouchableOpacity key={index} onLongPress={handleLongPressImage} style={{ position: "relative" }}>
            <Image
              source={{ uri }}
              style={{
                width: showRemoveButtons ? 90 : 100,
                height: showRemoveButtons ? 90 : 100,
                marginRight: 10,
                borderRadius: 5,
              }}
            />
            {showRemoveButtons && (
              <TouchableOpacity
                onPress={() => handleRemoveImage(index)}
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  backgroundColor: "red",
                  borderRadius: 15,
                  padding: 5,
                }}
              >
                <Text style={{ color: "white", fontSize: 12 }}>X</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <AvailabilitySelector availability={form.availability} onToggle={toggleAvailability} />

      <CustomButton title="Submit" onPress={handleSubmit} color="#007AFF" />
    </FormWrapper>
  );
}
