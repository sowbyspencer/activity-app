// -----------------------------------------------------------------------------
// ActivityForm.tsx - Main form for creating/editing activities
// -----------------------------------------------------------------------------
// Handles all form state, validation, and submission for activity creation/edit.
// Integrates ArcGISAddressSearch for GIS-validated address entry, image upload,
// and availability selection. Provides robust validation, error feedback, and
// controlled form state for both create and edit modes.
//
// Props:
//   - initialData: pre-filled data for edit mode
//   - onSubmit: callback for form submission
// ----------------------------------------------------------------------------

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

export default function ActivityForm({ initialData, onSubmit }: ActivityFormProps) {
  // Form state for all fields, including address, images, and availability
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
  const [addressSelected, setAddressSelected] = useState(false); // Set addressSelected to false on load if initialData exists (edit mode)
  const [addressFocused, setAddressFocused] = useState(false);

  // Refs for input focus
  const nameRef = useRef<any>(null);
  const costRef = useRef<any>(null);
  const urlRef = useRef<any>(null);
  const descriptionRef = useRef<any>(null);

  // On mount, if editing and address is pre-filled, trust DB values
  useEffect(() => {
    // If editing and address is pre-filled, allow submit but do not show green border
    if (initialData?.address && initialData.latitude != null && initialData.longitude != null) {
      setAddressSelected(false); // No green border on load
    }
  }, []); // Run once on mount

  // Real-time address validation only when editing
  useEffect(() => {
    if (addressFocused) {
      validate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.address, form.latitude, form.longitude, addressFocused]);

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
    // Address validation logic:
    // If editing (focused), require addressSelected (user must select from ArcGIS)
    // If not editing, just require address, latitude, longitude (pre-filled is valid)
    if (!form.address || !form.address.trim() || form.latitude == null || form.longitude == null || (addressFocused && !addressSelected)) {
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

  // Image picker logic
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, uri],
      }));
    }
  };

  // Toggle availability for a day
  const toggleAvailability = (day: keyof typeof form) => {
    setForm((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // Remove an image from the form
  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Show/hide remove buttons for images
  const handleLongPressImage = () => {
    setShowRemoveButtons((prev) => !prev);
  };

  // Hide remove buttons when tapping outside
  const handleTapOutsideScrollView = () => {
    setShowRemoveButtons(false);
  };

  // Helpers for cost and URL validation
  const isCostValid = !form.cost || /^(free|none)$/i.test(form.cost.trim()) || !isNaN(Number(form.cost));
  const isUrlValid =
    !form.url ||
    (() => {
      try {
        new URL(form.url.trim());
        return true;
      } catch {
        return false;
      }
    })();

  // Determine if all required fields are filled (for disabling Submit)
  const isFormComplete = Boolean(
    form.name.trim() &&
      form.description.trim() &&
      isCostValid &&
      isUrlValid &&
      form.images &&
      form.images.length > 0 &&
      form.address &&
      form.address.trim() &&
      form.latitude != null &&
      form.longitude != null
  );

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
        <View style={{ marginBottom: 10 }}>
          <ArcGISAddressSearch
            value={form.address}
            // Only show green border if user has selected an address in this session
            selected={addressSelected}
            error={!!errors.address}
            onSelect={(item) => {
              setForm((prev) => ({
                ...prev,
                address: item.address,
                latitude: item.location?.y || null,
                longitude: item.location?.x || null,
              }));
              setAddressSelected(true); // Only set to true when user selects
              if (addressFocused) validate();
            }}
            onFocus={() => setAddressFocused(true)}
            onBlur={() => {
              setAddressFocused(false);
              validate();
            }}
          />
        </View>
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
        <View style={{ marginBottom: 10 }}>
          <FlatList
            data={form.images}
            horizontal
            keyExtractor={(_, i) => i.toString()}
            style={{ marginBottom: 0 }}
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
          {errors.images ? <Text style={{ color: "#FF3B30", marginTop: 2, marginLeft: 5, fontSize: 13 }}>{errors.images}</Text> : null}
        </View>
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
      render: () => <CustomButton title="Submit" onPress={handleSubmit} color="#007AFF" opacity={!isFormComplete ? 0.5 : 1} />,
    },
  ];

  // Render the form as a FlatList of fields
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
