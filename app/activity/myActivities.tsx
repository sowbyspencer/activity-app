import React from "react";
import { View, Text, Button, FlatList, TouchableOpacity } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";

export default function MyActivitiesScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const activities = []; // Replace with actual data fetching logic

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "black" : "white",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: colorScheme === "dark" ? "white" : "black",
          marginBottom: 20,
        }}
      >
        My Activities
      </Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: colorScheme === "dark" ? "#555" : "#ddd",
            }}
            onPress={() => router.push(`/activity/${item.id}`)}
          >
            <Text
              style={{
                fontSize: 16,
                color: colorScheme === "dark" ? "white" : "black",
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Button
        title="Create Activity"
        onPress={() => router.push("/activity/create")}
      />
    </View>
  );
}
