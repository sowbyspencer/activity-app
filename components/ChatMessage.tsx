import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function ChatMessage({
  item,
  isUser,
}: {
  item: any;
  isUser: boolean;
}) {
  return (
    <View
      style={[
        styles.messageContainer,
        {
          alignSelf: isUser ? "flex-end" : "flex-start",
          alignItems: isUser ? "flex-end" : "flex-start",
        },
      ]}
    >
      {!isUser && (
        <View style={styles.senderInfo}>
          <Image
            source={{ uri: item.profile_image }}
            style={styles.profileImage}
          />
          <Text style={styles.senderName}>{item.sender_name}</Text>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          { backgroundColor: isUser ? "#007AFF" : "#E5E5EA" },
        ]}
      >
        <Text style={{ color: isUser ? "white" : "black" }}>
          {item.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 5,
    marginHorizontal: 10,
    maxWidth: "80%",
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 5,
  },
  senderName: {
    fontSize: 12,
    color: "#666",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
  },
});
