import React, { useState, useEffect } from "react";
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
    available_sun?: boolean;
    available_mon?: boolean;
    available_tue?: boolean;
    available_wed?: boolean;
    available_thu?: boolean;
    available_fri?: boolean;
    available_sat?: boolean;
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
    available_sun: initialData?.available_sun || false,
    available_mon: initialData?.available_mon || false,
    available_tue: initialData?.available_tue || false,
    available_wed: initialData?.available_wed || false,
    available_thu: initialData?.available_thu || false,
    available_fri: initialData?.available_fri || false,
    available_sat: initialData?.available_sat || false,
  });

  const [showRemoveButtons, setShowRemoveButtons] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log("ActivityForm initialized with:", form);
  }, []);

  useEffect(() => {
    console.log("Form state updated:", form);
  }, [form]);

  const validate = () => {
    const newErrors: any = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.location.trim()) newErrors.location = "Location is required.";
    // Cost: allow empty, 'free', or 'none' (case-insensitive) as null
    if (form.cost && !/^(free|none)$/i.test(form.cost.trim()) && isNaN(Number(form.cost))) {
      newErrors.cost = "Cost must be a number, 'Free', or 'None'. Leave blank if not applicable.";
    }
    if (!form.description.trim()) newErrors.description = "Description is required.";
    // URL: if not empty, must be a valid URL
    if (form.url && form.url.trim() !== "") {
      try {
        new URL(form.url.trim());
      } catch {
        newErrors.url = "Please enter a valid URL (including http:// or https://).";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    // Normalize cost
    let cost = form.cost;
    if (form.has_cost && (/^(free|none)$/i.test(cost.trim()) || cost.trim() === "")) cost = null;
    await onSubmit({ ...form, cost });
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

  const toggleAvailability = (day: keyof typeof form) => {
    setForm((prev) => ({
      ...prev,
      [day]: !prev[day],
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
      <CustomInput placeholder="Name" value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} error={errors.name} />
      <CustomInput
        placeholder="Location"
        value={form.location}
        onChangeText={(text) => setForm({ ...form, location: text })}
        error={errors.location}
      />
      <CustomInput placeholder="Cost" value={form.cost} onChangeText={(text) => setForm({ ...form, cost: text })} error={errors.cost} />
      <CustomInput placeholder="URL" value={form.url} onChangeText={(text) => setForm({ ...form, url: text })} error={errors.url} />
      <CustomInput
        placeholder="Description"
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
        error={errors.description}
      />

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

      <AvailabilitySelector
        available_sun={form.available_sun}
        available_mon={form.available_mon}
        available_tue={form.available_tue}
        available_wed={form.available_wed}
        available_thu={form.available_thu}
        available_fri={form.available_fri}
        available_sat={form.available_sat}
        onToggle={(day) => toggleAvailability(`available_${day}`)}
      />

      <CustomButton title="Submit" onPress={handleSubmit} color="#007AFF" />
    </FormWrapper>
  );
}
