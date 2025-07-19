import React, { useState, useEffect, useRef } from "react";
import { FlatList, Image, TouchableOpacity, View, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import AvailabilitySelector from "@/components/ui/AvailabilitySelector";
import FormWrapper from "@/components/ui/FormWrapper";
import ArcGISAddressSearch from "@/components/ArcGISAddressSearch";
import Constants from "expo-constants";

type ErrorState = { [key: string]: string };

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
    latitude?: number;
    longitude?: number;
    lat?: number;
    lon?: number;
  };
  onSubmit: (form: any) => Promise<void>;
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
    latitude: typeof initialData?.latitude !== "undefined" ? initialData.latitude : typeof initialData?.lat !== "undefined" ? initialData.lat : null,
    longitude:
      typeof initialData?.longitude !== "undefined" ? initialData.longitude : typeof initialData?.lon !== "undefined" ? initialData.lon : null,
  });
  const [showRemoveButtons, setShowRemoveButtons] = useState(false);
  const [errors, setErrors] = useState<ErrorState>({});
  // Track if address has been GIS validated since last change
  const [addressValidated, setAddressValidated] = useState(true);

  // Refs for input focus
  const nameRef = useRef<any>(null);
  const costRef = useRef<any>(null);
  const urlRef = useRef<any>(null);
  const descriptionRef = useRef<any>(null);

  // On mount, if editing and address is pre-filled, trust DB values
  useEffect(() => {
    console.log("[DEBUG] ActivityForm initialData:", initialData);
    console.log("[DEBUG] ActivityForm initial form state:", form);
    // Support both latitude/longitude and lat/lon from initialData
    const address = initialData?.address;
    const latitude =
      typeof initialData?.latitude !== "undefined" ? initialData.latitude : typeof initialData?.lat !== "undefined" ? initialData.lat : null;
    const longitude =
      typeof initialData?.longitude !== "undefined" ? initialData.longitude : typeof initialData?.lon !== "undefined" ? initialData.lon : null;
    if (address && latitude != null && longitude != null) {
      setForm((prev) => ({
        ...prev,
        address,
        latitude,
        longitude,
      }));
    }
  }, []);

  // Log form state whenever it changes
  useEffect(() => {
    console.log("[DEBUG] ActivityForm form state changed:", form);
  }, [form]);

  // When address, latitude, or longitude changes, reset addressValidated if changed from initialData
  useEffect(() => {
    const formLat = form.latitude != null ? Number(form.latitude) : null;
    const formLon = form.longitude != null ? Number(form.longitude) : null;
    const initialLat =
      initialData && (initialData.latitude != null ? Number(initialData.latitude) : initialData.lat != null ? Number(initialData.lat) : null);
    const initialLon =
      initialData && (initialData.longitude != null ? Number(initialData.longitude) : initialData.lon != null ? Number(initialData.lon) : null);
    if (initialData && (form.address !== initialData.address || formLat !== initialLat || formLon !== initialLon)) {
      setAddressValidated(false);
    } else {
      setAddressValidated(true);
    }
  }, [form.address, form.latitude, form.longitude, initialData]);

  // Helper to validate address with ArcGIS geoservice
  const validateAddressWithGIS = async (address: string, latitude: number | null, longitude: number | null) => {
    if (!address || latitude == null || longitude == null) return false;
    try {
      const arcgisKey = Constants.expoConfig?.extra?.arcgisApiKey;
      const url = `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(
        address
      )}&location=${longitude},${latitude}&outFields=Match_addr,geometry&token=${arcgisKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.candidates && data.candidates.length > 0) {
        // Accept if any candidate matches the address closely (score > 90)
        return data.candidates[0].score > 90;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Remove address validation from validate()
  const validate = async () => {
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
    // Address validation: only validate if changed from initialData
    let addressValid = true;
    let skipAddressValidation = false;
    const formLat = form.latitude != null ? Number(form.latitude) : null;
    const formLon = form.longitude != null ? Number(form.longitude) : null;
    const initialLat =
      initialData && (initialData.latitude != null ? Number(initialData.latitude) : initialData.lat != null ? Number(initialData.lat) : null);
    const initialLon =
      initialData && (initialData.longitude != null ? Number(initialData.longitude) : initialData.lon != null ? Number(initialData.lon) : null);
    // Always require non-empty address, lat, lon
    if (!form.address || !form.address.trim() || formLat == null || formLon == null) {
      addressValid = false;
      skipAddressValidation = false;
    } else if (initialData && form.address === initialData.address && formLat === initialLat && formLon === initialLon) {
      // Unchanged from DB, always valid, skip GIS validation
      skipAddressValidation = true;
      addressValid = true;
    } else if (initialData && (form.address !== initialData.address || formLat !== initialLat || formLon !== initialLon)) {
      // Only allow submit if GIS validation passes
      if (!addressValidated) {
        addressValid = false;
        newErrors.address = "Please verify the address.";
      } else {
        addressValid = true;
      }
    }
    if (!skipAddressValidation && (!form.address || !form.address.trim() || formLat == null || formLon == null)) {
      newErrors.address = "Please select a valid address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add a function to trigger GIS validation and set addressValidated
  const handleAddressSelect = async (item: any) => {
    setForm((prev) => ({
      ...prev,
      address: item.address,
      latitude: item.location?.y || null,
      longitude: item.location?.x || null,
    }));
    // Validate with GIS immediately
    const valid = await validateAddressWithGIS(item.address, item.location?.y || null, item.location?.x || null);
    setAddressValidated(valid);
    if (!valid) {
      setErrors((prev) => ({ ...prev, address: "Please select a valid address." }));
    } else {
      setErrors((prev) => {
        const { address, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async () => {
    console.log("[DEBUG] handleSubmit: form.latitude =", form.latitude, "form.longitude =", form.longitude);
    const valid = await validate();
    if (!valid) return;
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

  // Helper for cost validation
  const isCostValid = !form.cost || /^(free|none)$/i.test(form.cost.trim()) || !isNaN(Number(form.cost));
  // Helper for URL validation
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
      // Address must be GIS validated if changed
      (addressValidated ||
        (initialData &&
          form.address === initialData.address &&
          form.latitude === (initialData.latitude ?? initialData.lat) &&
          form.longitude === (initialData.longitude ?? initialData.lon)))
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
            onChangeText={(text: string) => {
              setForm((prev) => ({
                ...prev,
                address: text,
                latitude: null,
                longitude: null,
              }));
              setAddressValidated(false);
            }}
            onSelect={handleAddressSelect}
          />
          {errors.address && <Text style={{ color: "#FF3B30", marginTop: 4, marginLeft: 5, fontSize: 13 }}>{errors.address}</Text>}
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
