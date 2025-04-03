import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { fetchMatchedGroups } from "@/api/groupService";

export default function GroupsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const user_id = 1; // 🔹 Hardcoded for now, should come from auth context
      const data = await fetchMatchedGroups(user_id);
      setGroups(data || []);
    };

    fetchGroups();
  }, []);

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
          Groups
        </Text>
      </View>

      {/* Group List */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.activity_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              height: 50,
              justifyContent: "center",
              paddingHorizontal: 15,
              borderBottomWidth: 1,
              borderBottomColor: colorScheme === "dark" ? "#555" : "#ddd",
            }}
            onPress={() =>
              router.push({
                pathname: `/activityGroup/${item.activity_id}`,
                params: { user_id: 1 }, // 🔹 Pass user_id in navigation
              })
            }
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Activity Image */}
              {item.activity_image ? (
                <Image
                  source={{ uri: item.activity_image }}
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
              {/* Group Name */}
              <Text
                style={{
                  fontSize: 16,
                  color: colorScheme === "dark" ? "white" : "black",
                }}
              >
                {item.activity_name}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
