import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, SafeAreaView, Alert } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/api/config";
import { useFocusEffect } from "@react-navigation/native";
import SwipeableActivityItem from "@/components/ui/SwipeableActivityItem";

type Activity = {
  id: number;
  name: string;
  description: string;
  location: string;
  has_cost: boolean;
  cost: number;
  available_sun: boolean;
  available_mon: boolean;
  available_tue: boolean;
  available_wed: boolean;
  available_thu: boolean;
  available_fri: boolean;
  available_sat: boolean;
  url: string;
  images: string[];
};

export default function MyActivitiesScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { userId } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchActivities = async () => {
        try {
          const response = await fetch(`${API_URL}/activities/created?user_id=${userId}`);
          if (response.ok) {
            const data = await response.json();
            const transformedData = data.map((activity) => ({
              ...activity,
            }));
            setActivities(transformedData);
          } else {
            console.error("Failed to fetch activities created by user");
          }
        } catch (error) {
          console.error("Error fetching activities created by user:", error);
        }
      };

      fetchActivities();
    }, [userId])
  );

  const handleDelete = (activityId: number) => (closeSwipe?: () => void) => {
    Alert.alert("Delete Activity", "Are you sure you want to delete this activity? This action cannot be undone.", [
      { text: "Cancel", style: "cancel", onPress: () => closeSwipe && closeSwipe() },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/activities/${activityId}`, { method: "DELETE" });
            if (response.ok) {
              setActivities((prev) => prev.filter((a) => a.id !== activityId));
            } else {
              const errorData = await response.json();
              alert(`Failed to delete activity: ${errorData.error}`);
            }
          } catch (error) {
            alert("Error deleting activity. Please try again.");
          }
        },
      },
    ]);
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <SwipeableActivityItem onDelete={handleDelete(item.id)}>
      <TouchableOpacity
        style={{
          height: 50,
          justifyContent: "center",
          paddingHorizontal: 15,
          borderBottomWidth: 1,
          borderBottomColor: colorScheme === "dark" ? "#555" : "#ddd",
        }}
        onPress={() => {
          router.push({
            pathname: `/activity/edit`,
            params: { activity: JSON.stringify(item) },
          });
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Activity Image */}
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 10,
              }}
            />
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colorScheme === "dark" ? "#555" : "#D3D3D3",
                marginRight: 10,
              }}
            />
          )}
          {/* Activity Name */}
          <Text
            style={{
              fontSize: 16,
              color: colorScheme === "dark" ? "white" : "black",
            }}
          >
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    </SwipeableActivityItem>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "black" : "white",
      }}
    >
      {/* Activity List */}
      <FlatList data={activities} keyExtractor={(item) => item.id.toString()} renderItem={renderActivityItem} />
      {/* Create Activity Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          height: 60,
          borderRadius: 30,
          backgroundColor: colorScheme === "dark" ? "#333" : "#f5f5f5",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 5,
        }}
        onPress={() => router.push("/activity/create")}
      >
        <Text
          style={{
            fontSize: 24,
            color: colorScheme === "dark" ? "white" : "black",
            marginRight: 5,
          }}
        >
          +
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: colorScheme === "dark" ? "white" : "black",
          }}
        >
          New Activity
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
