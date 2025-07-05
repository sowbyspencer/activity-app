import React from "react";
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { API_URL } from "@/api/config";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const userId = 1; // Replace with dynamic user ID if available

  const handleRefreshDeclined = async () => {
    Alert.alert("Refresh Declined Activities", "Do you want to refresh Declined activities?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Refresh",
        style: "destructive",
        onPress: async () => {
          await fetch(`${API_URL}/activities/reset-swipes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          });
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

  const options = [
    {
      id: "1",
      title: "My Profile",
      navigateTo: { pathname: "profile", params: { userId } },
    },
    { id: "2", title: "My Activities", navigateTo: "/activity/myActivities" },
    { id: "3", title: "Refresh Declined Activities", onPress: handleRefreshDeclined },
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

      {/* Options List */}
      <FlatList
        data={options}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
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
        )}
      />
    </SafeAreaView>
  );
}
