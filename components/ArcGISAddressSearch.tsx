import React, { useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, ActivityIndicator, useColorScheme } from "react-native";
import Constants from "expo-constants";
import { useLocationContext } from "@/context/LocationContext";

export default function ArcGISAddressSearch({
  onSelect,
  style,
  showResults = true,
  onDropdownOpen,
}: {
  onSelect: (result: any) => void;
  style?: any;
  showResults?: boolean;
  onDropdownOpen?: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selected, setSelected] = useState(false);
  const colorScheme = useColorScheme();
  const { coords } = useLocationContext();

  const arcgisKey = Constants.expoConfig?.extra?.arcgisApiKey;

  // Log layout changes
  const [layout, setLayout] = useState<any>(null);

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
      console.log(
        "[ArcGIS] Candidates:",
        (data.candidates || []).map((c: any) => c.address)
      );
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

  const handleSelect = (item: any) => {
    setQuery(item.address);
    setResults([]);
    setDropdownVisible(false);
    setSelected(true);
    if (onDropdownOpen) onDropdownOpen(false);
    onSelect(item);
  };

  const isDark = colorScheme === "dark";

  return (
    <View
      style={[{ marginBottom: 0, position: "relative", borderColor: "transparent", borderWidth: 0 }]}
      onLayout={(e) => {
        setLayout(e.nativeEvent.layout);
      }}
    >
      <TextInput
        placeholder="Location"
        placeholderTextColor={isDark ? "#aaa" : "#666"}
        value={query}
        onChangeText={searchAddress}
        style={[
          {
            width: "100%",
            height: 50,
            borderWidth: selected ? 2 : 1,
            borderColor: selected ? "#3CB371" : "#ccc",
            borderRadius: 10,
            paddingHorizontal: 10,
            marginBottom: 15,
            color: isDark ? "#fff" : "#000",
            backgroundColor: isDark ? "#222" : "#f9f9f9",
          },
          style,
        ]}
        onFocus={() => {
          if (results.length > 0) {
            setDropdownVisible(true);
            if (onDropdownOpen) onDropdownOpen(true);
          }
        }}
        onBlur={() =>
          setTimeout(() => {
            setDropdownVisible(false);
            if (onDropdownOpen) onDropdownOpen(false);
          }, 200)
        }
      />
      {/* {loading && <ActivityIndicator size="small" color="#007AFF" style={{ marginBottom: 8 }} />} */}
      {error && <Text style={{ color: "#FF3B30", marginBottom: 8 }}>{error}</Text>}
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
