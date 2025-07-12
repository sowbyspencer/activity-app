import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { API_URL } from "@/api/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useDeviceLocation from "@/hooks/useDeviceLocation";
import { resetDeclinedActivities, fetchActivities } from "@/api/activityService";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [userId, setUserId] = useState<number | null>(null);
  const { coords } = useDeviceLocation();

  useEffect(() => {
    const loadUserId = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      if (storedId) setUserId(Number(storedId));
    };
    loadUserId();
  }, []);

  const handleRefreshDeclined = async () => {
    Alert.alert("Refresh Declined Activities", "Do you want to refresh Declined activities?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Refresh",
        style: "destructive",
        onPress: async () => {
          if (userId == null) return;
          await resetDeclinedActivities(userId);
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
