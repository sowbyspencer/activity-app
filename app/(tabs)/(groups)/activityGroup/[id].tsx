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
import { useAuth } from "@/context/AuthContext";

export default function ActivityGroupScreen() {
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams(); // Only get activity group id from params
  const { userId } = useAuth(); // Get userId from AuthContext
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
    console.log("ActivityGroupScreen userId:", userId); // Log the userId being used
    const loadActivityGroup = async () => {
      try {
        const data = await fetchActivityGroup(Number(id), Number(userId));

        // ✅ Ensure `members` is an array
        if (!Array.isArray(data.members)) {
          data.members = [];
        }

        // ✅ Ensure every member has a valid `id`
        data.members = data.members.map((member: any, index: number) => ({
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
  }, [id, userId]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "black" : "white",
      }}
    >
      {/* Activity Group Image & Name */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/activityInfo",
            params: { id: activity.activity_id },
          })
        }
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
            chat_id: activity.chat_id, // Pass the group chat_id for the group chat row
            activityName: activity.activity_name, // Pass activity name for group chat
          },
          ...activity.members.map((member: any) => ({
            ...member,
            chatPartner: member.name, // Pass member name for direct chat
          })),
        ]}
        keyExtractor={(item, index) => `${item.id || "temp"}-${index}`} // Ensure unique keys by appending index
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
              console.log("Navigating to chat with chat_id:", item.chat_id); // Log the chat_id being passed
              router.push({
                pathname: "/chat/[id]",
                params: {
                  id: item.chat_id,
                  activityName: item.activityName, // For group chat
                  chatPartner: item.chatPartner, // For direct chat
                },
              });
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
