import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { fetchActivityGroup } from "@/api/activityGroupService";

export default function ActivityGroupScreen() {
  const colorScheme = useColorScheme();
  const { id, user_id } = useLocalSearchParams(); // Get activity ID & user ID
  const router = useRouter();
  const [activity, setActivity] = useState({
    activity_id: "",
    activity_name: "",
    activity_image: "",
    chat_id: "",
    lastMessage: "",
    members: [],
  });

  useEffect(() => {
    const loadActivityGroup = async () => {
      try {
        const data = await fetchActivityGroup(id as string, user_id as string);

        // ✅ Ensure `members` is an array
        if (!Array.isArray(data.members)) {
          data.members = [];
        }

        // ✅ Ensure every member has a valid `id`
        data.members = data.members.map((member, index) => ({
          id: member.id || `temp-${index}`, // Temporary ID if missing
          name: member.name || "Unknown User",
          profile_image: member.profile_image || null,
          chat_id: member.chat_id || null,
          lastMessage: member.lastMessage || "No messages yet...",
        }));

        setActivity(data);
      } catch (error) {
        console.error("Error fetching activity group:", error);
      }
    };

    loadActivityGroup();
  }, [id, user_id]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "black" : "white",
      }}
    >
      {/* Activity Group Image & Name */}
      <TouchableOpacity
        onPress={() => router.push(`/activity/${activity.activity_id}`)} // ✅ Navigate to Activity Details
        style={{ alignItems: "center", paddingVertical: 15 }}
      >
        {activity.activity_image ? (
          <Image
            source={{ uri: activity.activity_image }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        ) : (
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colorScheme === "dark" ? "#555" : "#D3D3D3",
            }}
          />
        )}
        <Text
          style={{
            fontSize: 16,
            marginTop: 10,
            color: colorScheme === "dark" ? "white" : "black",
          }}
        >
          {activity.activity_name}
        </Text>
      </TouchableOpacity>

      {/* Member List with Group Chat */}
      <FlatList
        data={[
          {
            id: activity.chat_id || "group",
            name: "Group Chat",
            lastMessage: activity.lastMessage || "No messages yet...",
            profile_image: activity.activity_image, // ✅ Use activity image
          },
          ...activity.members,
        ]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              height: 60,
              justifyContent: "center",
              paddingHorizontal: 15,
              borderBottomWidth: 1,
              borderBottomColor: colorScheme === "dark" ? "#555" : "#ddd",
            }}
            onPress={() => {
              if (item.chat_id && typeof item.chat_id === "number") {
                router.push(`/chat/${item.chat_id}`);
              } else if (item.id && typeof item.id === "number") {
                router.push(`/chat/${item.id}`);
              }
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Profile Image or Placeholder */}
              {item.profile_image ? (
                <Image
                  source={{ uri: item.profile_image }}
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
                    backgroundColor:
                      colorScheme === "dark" ? "#555" : "#D3D3D3",
                    marginRight: 10,
                  }}
                />
              )}

              {/* User Name and Last Message Preview */}
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    color: colorScheme === "dark" ? "white" : "black",
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colorScheme === "dark" ? "#AAA" : "#666",
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.lastMessage}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
