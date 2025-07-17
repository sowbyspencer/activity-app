import React, { useState, useEffect, useRef } from "react";
import { FlatList, Image, TouchableOpacity, View, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import AvailabilitySelector from "@/components/ui/AvailabilitySelector";
import FormWrapper from "@/components/ui/FormWrapper";
import ArcGISAddressSearch from "@/components/ArcGISAddressSearch";

type ActivityFormProps = {
  initialData?: {
    name?: string;
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
    address: string;
    latitude: number;
    longitude: number;
  };
  onSubmit: (form: any) => Promise<void>;
};

type ErrorState = {
  name?: string;
  cost?: string;
  url?: string;
  description?: string;
  images?: string;
  address?: string;
};

export default function ActivityForm({ initialData, onSubmit }: ActivityFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
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
    address: initialData?.address || "",
    latitude: initialData?.latitude ?? null,
    longitude: initialData?.longitude ?? null,
  });

  const [showRemoveButtons, setShowRemoveButtons] = useState(false);
  const [errors, setErrors] = useState<ErrorState>({});
  const [addressSelected, setAddressSelected] = useState(!!initialData?.address);

  // Refs for input focus
  const nameRef = useRef<any>(null);
  const costRef = useRef<any>(null);
  const urlRef = useRef<any>(null);
  const descriptionRef = useRef<any>(null);

  const validate = () => {
    const newErrors: any = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
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
    // Require at least one image
    if (!form.images || form.images.length === 0) {
      newErrors.images = "Please add at least one image.";
    }
    // Require valid address
    // Allow submit if address, latitude, and longitude are present (even if not reselected)
    if (!form.address || !form.address.trim() || form.latitude == null || form.longitude == null) {
      newErrors.address = "Please select a valid address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    // Normalize cost
    let cost = form.cost;
    if (form.has_cost && (/^(free|none)$/i.test(cost.trim()) || cost.trim() === "")) cost = "";
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
      const uri = result.assets[0].uri;
      console.log("[EditActivity] Selected image URI");
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, uri],
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

  // Determine if all required fields are filled (for disabling Submit)
  const isFormComplete =
    form.name.trim() &&
    form.description.trim() &&
    (!form.cost || !isNaN(Number(form.cost)) || /^(free|none)$/i.test(form.cost.trim())) &&
    (!form.url ||
      (() => {
        try {
          new URL(form.url.trim());
          return true;
        } catch {
          return false;
        }
      })()) &&
    form.images &&
    form.images.length > 0 &&
    form.address &&
    form.address.trim() &&
    form.latitude != null &&
    form.longitude != null;

  // Compose form fields as items for FlatList
  const formItems = [
    {
      key: "name",
      render: () => (
        <CustomInput
          ref={nameRef}
          placeholder="Name"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          error={errors.name}
          returnKeyType="next"
        />
      ),
    },
    {
      key: "address",
      render: () => (
        <ArcGISAddressSearch
          value={form.address}
          selected={addressSelected}
          onSelect={(item) => {
            setForm((prev) => ({
              ...prev,
              address: item.address,
              latitude: item.location?.y || null,
              longitude: item.location?.x || null,
            }));
            setAddressSelected(true);
          }}
        />
      ),
    },
    {
      key: "cost",
      render: () => (
        <CustomInput
          ref={costRef}
          placeholder="Cost"
          value={form.cost}
          onChangeText={(text) => setForm({ ...form, cost: text })}
          error={errors.cost}
          returnKeyType="next"
          onSubmitEditing={() => urlRef.current && urlRef.current.focus()}
        />
      ),
    },
    {
      key: "url",
      render: () => (
        <CustomInput
          ref={urlRef}
          placeholder="URL"
          value={form.url}
          onChangeText={(text) => setForm({ ...form, url: text })}
          error={errors.url}
          returnKeyType="next"
          onSubmitEditing={() => descriptionRef.current && descriptionRef.current.focus()}
        />
      ),
    },
    {
      key: "description",
      render: () => (
        <CustomInput
          ref={descriptionRef}
          placeholder="Description"
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          error={errors.description}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      ),
    },
    {
      key: "addImages",
      render: () => <CustomButton title="Add Images" onPress={pickImage} color="#007AFF" />,
    },
    {
      key: "images",
      render: () => (
        <FlatList
          data={form.images}
          horizontal
          keyExtractor={(_, i) => i.toString()}
          style={{ marginBottom: 10 }}
          renderItem={({ item: uri, index }) => (
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
          )}
        />
      ),
    },
    {
      key: "availability",
      render: () => (
        <AvailabilitySelector
          available_sun={form.available_sun}
          available_mon={form.available_mon}
          available_tue={form.available_tue}
          available_wed={form.available_wed}
          available_thu={form.available_thu}
          available_fri={form.available_fri}
          available_sat={form.available_sat}
          onToggle={(day: string) => toggleAvailability(day as keyof typeof form)}
        />
      ),
    },
    {
      key: "submit",
      render: () => (
        <CustomButton title="Submit" onPress={handleSubmit} color="#007AFF" disabled={!isFormComplete} opacity={!isFormComplete ? 0.5 : 1} />
      ),
    },
    {
      key: "imagesError",
      render: () => (errors.images ? <Text style={{ color: "#FF3B30", marginBottom: 10, marginLeft: 5, fontSize: 13 }}>{errors.images}</Text> : null),
    },
    {
      key: "addressError",
      render: () =>
        errors.address ? <Text style={{ color: "#FF3B30", marginBottom: 10, marginLeft: 5, fontSize: 13 }}>{errors.address}</Text> : null,
    },
  ];

  return (
    <FlatList
      data={formItems}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => item.render()}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<FormWrapper>{null}</FormWrapper>}
    />
  );
}
