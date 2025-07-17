import React, { useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, ActivityIndicator, useColorScheme } from "react-native";
import Constants from "expo-constants";

export default function ArcGISAddressSearch({
  onSelect,
  style,
  showResults = true,
}: {
  onSelect: (result: any) => void;
  style?: any;
  showResults?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  const arcgisKey = Constants.expoConfig?.extra?.arcgisApiKey;

  const searchAddress = async (text: string) => {
    setQuery(text);
    setError(null);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const url = `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(
        text
      )}&outFields=Match_addr,Addr_type,StAddr,City,Region,Country,Postal,LongLabel,ShortLabel,Type,PlaceName,Place_addr,Phone,URL,Rank,AddBldg,AddNum,AddNumFrom,AddNumTo,AddRange,Side,StPreDir,StPreType,StName,StType,StDir,StSuffix,Neighborhood,Subregion,RegionAbbr,CountryCode,LangCode,Distance,Unit,Score,MatchScore,geometry&token=${arcgisKey}`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.candidates || []);
    } catch (e) {
      setError("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  const isDark = colorScheme === "dark";

  return (
    <View style={[{ marginBottom: 0 }, style]}>
      <TextInput
        placeholder="Location"
        placeholderTextColor={isDark ? "#aaa" : "#666"}
        value={query}
        onChangeText={searchAddress}
        style={{
          width: "100%",
          height: 50,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          paddingHorizontal: 10,
          marginBottom: 15,
          color: isDark ? "#fff" : "#000",
          backgroundColor: isDark ? "#222" : "#f9f9f9",
        }}
      />
      {loading && <ActivityIndicator size="small" color="#007AFF" style={{ marginBottom: 8 }} />}
      {error && <Text style={{ color: "#FF3B30", marginBottom: 8 }}>{error}</Text>}
      {showResults && results.length > 0 && (
        <View
          style={{
            maxHeight: 180,
            borderWidth: 1,
            borderColor: isDark ? "#444" : "#eee",
            borderRadius: 6,
            backgroundColor: isDark ? "#181818" : "#fafafa",
            marginBottom: 10,
          }}
        >
          <FlatList
            data={results}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setQuery(item.address);
                  setResults([]);
                  onSelect(item);
                }}
                style={{ paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: isDark ? "#333" : "#eee" }}
              >
                <Text style={{ fontSize: 15, color: isDark ? "#fff" : "#222" }}>{item.address}</Text>
                {item.location && (
                  <Text style={{ fontSize: 12, color: isDark ? "#aaa" : "#888" }}>
                    Lat: {item.location.y}, Lon: {item.location.x}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}
