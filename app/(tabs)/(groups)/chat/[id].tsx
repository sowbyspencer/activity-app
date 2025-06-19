import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { fetchChatMessages, sendMessage } from "@/api/chatService";
import ChatMessage from "@/components/ChatMessage";
import { useAuth } from "@/context/AuthContext";

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const { id, activityName, chatPartner: chatPartnerParam } = useLocalSearchParams(); // Only get chat id from params
  const { userId } = useAuth(); // Use userId from AuthContext
  const [messages, setMessages] = useState<any[]>([]); // Fix type to any[]
  const [newMessage, setNewMessage] = useState("");
  const [chatPartner, setChatPartner] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const loadMessages = async () => {
      const data = await fetchChatMessages(id as string);
      setMessages(data || []);

      // Prefer activityName for group chats, chatPartner for direct chats
      let headerTitle = (activityName as string) || (chatPartnerParam as string) || "Chat";
      // If no activityName and there are messages, try to get the partner from messages
      if (!activityName && data.length > 0) {
        const partner = data.find((msg: any) => msg.user_id !== parseInt(userId as string));
        if (partner) headerTitle = partner.sender_name;
      }
      setChatPartner(headerTitle);
      router.setParams({ chatPartner: headerTitle });
    };

    loadMessages();
  }, [id, userId, activityName, chatPartnerParam]); // Use userId as dependency

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const sentMessage = await sendMessage(id as string, newMessage, Number(userId)); // pass userId
    if (sentMessage) {
      setMessages((prev: any[]) => [sentMessage, ...prev]);
      setNewMessage("");
    }
  };

  const renderMessage = ({ item }: any) => {
    const isUser = item.user_id === parseInt(userId as string); // Use userId from AuthContext
    return <ChatMessage item={item} isUser={isUser} />;
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "black" : "white",
      }}
    >
      <FlatList data={messages} keyExtractor={(item) => item.id.toString()} inverted renderItem={renderMessage} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: "#ccc",
        }}
      >
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
          style={{
            flex: 1,
            padding: 10,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 20,
            color: colorScheme === "dark" ? "white" : "black",
            backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "white",
          }}
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          style={{
            marginLeft: 10,
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
