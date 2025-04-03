import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const userId = 1; // Replace with dynamic user ID if available

  const options = [
    {
      id: "1",
      title: "My Profile",
      navigateTo: { pathname: "profile", params: { userId } },
    }, // Pass user ID
    { id: "2", title: "My Activities", navigateTo: "/activity/myActivities" },
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
            onPress={() => router.push(item.navigateTo)} // Updated navigation
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
