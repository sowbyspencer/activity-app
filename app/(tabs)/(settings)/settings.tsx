import React, { useEffect } from "react";
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, TextInput } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { useRadius } from "@/context/RadiusContext";
import { resetDeclinedActivities } from "@/api/activityService";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { radius, setRadius } = useRadius();
  const [radiusInput, setRadiusInput] = React.useState(radius.toString());

  useEffect(() => {
    setRadiusInput(radius.toString());
  }, [radius]);

  const handleRefreshDeclined = async () => {
    Alert.alert("Refresh Declined Activities", "Do you want to refresh Declined activities?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Refresh",
        style: "destructive",
        onPress: async () => {
          await resetDeclinedActivities();
          Alert.alert("Success", "Declined activities have been refreshed.", [
            {
              text: "OK",
              onPress: () => router.replace("/"),
            },
          ]);
        },
      },
    ]);
  };

  const handleRadiusChange = (value: string) => {
    // Allow empty string for editing
    setRadiusInput(value);
    // Only set radius if valid number
    const num = Number(value);
    if (value !== "" && !isNaN(num)) {
      if (num > 3500) {
        setRadius(3500);
        setRadiusInput("3500");
      } else if (num > 0) {
        setRadius(num);
      }
    }
  };

  const handleRadiusBlur = () => {
    // If input is empty, set radius to 1
    if (radiusInput === "") {
      setRadius(1);
      setRadiusInput("1");
    }
  };

  const options = [
    {
      id: "1",
      title: "My Profile",
      navigateTo: { pathname: "profile" },
    },
    { id: "2", title: "My Activities", navigateTo: "/activity/myActivities" },
    { id: "3", title: "Refresh Declined Activities", onPress: handleRefreshDeclined },
    {
      id: "4",
      title: "Activity Search Radius (km)",
      render: () => (
        <View style={{ paddingVertical: 10 }}>
          <Text style={{ fontSize: 16, marginBottom: 8, color: colorScheme === "dark" ? "white" : "black" }}>Activity Search Radius (km):</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colorScheme === "dark" ? "#555" : "#ccc",
              borderRadius: 8,
              padding: 10,
              fontSize: 16,
              color: colorScheme === "dark" ? "white" : "black",
              backgroundColor: colorScheme === "dark" ? "#222" : "#f9f9f9",
              width: 120,
            }}
            keyboardType="number-pad"
            value={radiusInput}
            onChangeText={handleRadiusChange}
            onBlur={handleRadiusBlur}
            maxLength={4}
          />
          <Text style={{ fontSize: 14, marginTop: 4, color: colorScheme === "dark" ? "#aaa" : "#555" }}>Enter a value between 1 and 3,500</Text>
        </View>
      ),
    },
  ];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "black" : "white",
      }}
    >
      {/* Header */}
      <View
        style={{
          height: 50,
          justifyContent: "center",
          paddingHorizontal: 15,
          backgroundColor: colorScheme === "dark" ? "#333" : "#D3D3D3",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: colorScheme === "dark" ? "white" : "black",
          }}
        >
          Settings
        </Text>
      </View>

      {/* Options List with integrated radius selector */}
      <FlatList
        data={options}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          item.render ? (
            item.render()
          ) : (
            <TouchableOpacity
              style={{
                height: 50,
                justifyContent: "center",
                paddingHorizontal: 15,
                borderBottomWidth: 1,
                borderBottomColor: colorScheme === "dark" ? "#555" : "#ddd",
              }}
              onPress={() => (item.onPress ? item.onPress() : router.push(item.navigateTo))}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colorScheme === "dark" ? "white" : "black",
                }}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          )
        }
      />
    </SafeAreaView>
  );
}
