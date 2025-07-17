// -----------------------------------------------------------------------------
// ArcGISAddressSearch.tsx - Address autocomplete/search using ArcGIS API
// -----------------------------------------------------------------------------
// Provides a controlled address input with real-time ArcGIS suggestions,
// dropdown UI, and selection callback. Used in ActivityForm for GIS-validated
// address entry. Handles error, loading, and selection states.
//
// Props:
//   - onSelect: callback when a suggestion is selected
//   - value: controlled input value
//   - selected: whether a valid address is selected
//   - error: error state for validation
//   - onFocus/onBlur: for parent validation feedback
//   - onChangeText: notifies parent on every keystroke
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, ActivityIndicator, useColorScheme } from "react-native";
import Constants from "expo-constants";
import { useLocationContext } from "@/context/LocationContext";

export default function ArcGISAddressSearch({
  onSelect,
  style,
  showResults = true,
  onDropdownOpen,
  value,
  selected,
  error, // <-- already added
  onFocus,
  onBlur,
}: {
  onSelect: (result: any) => void;
  style?: any;
  showResults?: boolean;
  onDropdownOpen?: (open: boolean) => void;
  value?: string;
  selected?: boolean;
  error?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  // State for input query, results, loading, error, dropdown, and selection
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorState, setError] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedState, setSelectedState] = useState(false);
  const colorScheme = useColorScheme();
  const { coords } = useLocationContext();
  const arcgisKey = Constants.expoConfig?.extra?.arcgisApiKey;
  const [layout, setLayout] = useState<any>(null);

  // Search ArcGIS for address suggestions on input change
  const searchAddress = async (text: string) => {
    setQuery(text);
    setError(null);
    if (text.length < 3) {
      setResults([]);
      setDropdownVisible(false);
      if (onDropdownOpen) onDropdownOpen(false);
      return;
    }
    setLoading(true);
    try {
      let locationParam = "";
      if (coords && coords.latitude && coords.longitude) {
        locationParam = `&location=${coords.longitude},${coords.latitude}`;
      }
      const url = `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(
        text
      )}${locationParam}&outFields=Match_addr,Addr_type,StAddr,City,Region,Country,Postal,LongLabel,ShortLabel,Type,PlaceName,Place_addr,Phone,URL,Rank,AddBldg,AddNum,AddNumFrom,AddNumTo,AddRange,Side,StPreDir,StPreType,StName,StType,StDir,StSuffix,Neighborhood,Subregion,RegionAbbr,CountryCode,LangCode,Distance,Unit,Score,MatchScore,geometry&token=${arcgisKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setError(data.error.message || "ArcGIS API error");
        setResults([]);
        setDropdownVisible(false);
        if (onDropdownOpen) onDropdownOpen(false);
        return;
      }
      setResults(data.candidates || []);
      const open = (data.candidates || []).length > 0;
      setDropdownVisible(open);
      if (onDropdownOpen) onDropdownOpen(open);
    } catch (e) {
      setError("Failed to fetch results");
      setDropdownVisible(false);
      if (onDropdownOpen) onDropdownOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle selection of a suggestion
  const handleSelect = (item: any) => {
    setQuery(item.address);
    setResults([]);
    setDropdownVisible(false);
    setSelectedState(true);
    if (onDropdownOpen) onDropdownOpen(false);
    onSelect(item);
  };

  const isDark = colorScheme === "dark";
  // Use selected prop if provided, otherwise use internal state
  const isSelected = selected !== undefined ? selected : selectedState;

  // Only show green border if a valid address is selected
  let borderColor = "#ccc";
  let borderWidth = 1;
  let showError = false;
  if (error) {
    borderColor = "#FF3B30";
    borderWidth = 1.5;
    showError = true;
  } else if (isSelected && query && query.trim()) {
    borderColor = "#3CB371";
    borderWidth = 2;
  }

  // When the address is cleared, remove green border and error
  useEffect(() => {
    if (!query || !query.trim()) {
      setSelectedState(false);
    }
    // If the error is showing and the error prop is now false, also hide error message
    // (error prop is controlled by parent, so showError will update automatically)
  }, [query]);

  // When a valid address is selected, remove error and show green border
  useEffect(() => {
    if (isSelected && !error && query && query.trim()) {
      // This will ensure border is green and error message is hidden
      // No state update needed, just rely on props and logic
    }
  }, [isSelected, error, query]);

  // Keep query in sync with value prop
  useEffect(() => {
    if (typeof value === "string" && value !== query) {
      setQuery(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Render input, dropdown, and error states
  return (
    <View
      style={[{ marginBottom: 0, position: "relative", borderColor: "transparent", borderWidth: 0 }, style]}
      onLayout={(e) => {
        setLayout(e.nativeEvent.layout);
      }}
    >
      <TextInput
        placeholder="Address or place"
        placeholderTextColor={isDark ? "#aaa" : "#666"}
        value={query}
        onChangeText={searchAddress}
        style={[
          {
            width: "100%",
            height: 50,
            borderWidth,
            borderColor,
            borderRadius: 10,
            paddingHorizontal: 10,
            marginBottom: 2,
            color: isDark ? "#fff" : "#000",
            backgroundColor: isDark ? "#222" : "#f9f9f9",
          },
          style,
        ]}
        onFocus={(e) => {
          if (results.length > 0) {
            setDropdownVisible(true);
            if (onDropdownOpen) onDropdownOpen(true);
          }
          if (onFocus) onFocus();
        }}
        onBlur={(e) => {
          setTimeout(() => {
            setDropdownVisible(false);
            if (onDropdownOpen) onDropdownOpen(false);
          }, 200);
          if (onBlur) onBlur();
        }}
      />
      {showError && <Text style={{ color: "#FF3B30", marginBottom: 10, marginLeft: 5, fontSize: 13 }}>Please select a valid address.</Text>}
      {/* {loading && <ActivityIndicator size="small" color="#007AFF" style={{ marginBottom: 8 }} />} */}
      {errorState && <Text style={{ color: "#FF3B30", marginBottom: 8 }}>{errorState}</Text>}
      {/* Show dropdown with suggestions */}
      {dropdownVisible && (
        <View
          style={{
            position: "absolute",
            top: 50, // height of input
            left: 0,
            right: 0,
            zIndex: 100,
            maxHeight: 180,
            borderWidth: 1,
            borderColor: isDark ? "#444" : "#eee",
            borderRadius: 6,
            backgroundColor: isDark ? "#181818" : "#fafafa",
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <FlatList
            data={results}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={{ paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: isDark ? "#333" : "#eee" }}
              >
                <Text style={{ fontSize: 15, color: isDark ? "#fff" : "#222" }}>{item.address}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}
