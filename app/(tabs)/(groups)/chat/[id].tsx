import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { fetchChatMessages, sendMessage } from "@/api/chatService";
import ChatMessage from "@/components/ChatMessage";

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const { id, user_id } = useLocalSearchParams(); // Retrieve user_id from parameters
  console.log("ChatScreen user_id:", user_id); // Log the user_id being used
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatPartner, setChatPartner] = useState<string>("");

  useEffect(() => {
    const loadMessages = async () => {
      const data = await fetchChatMessages(id as string);
      setMessages(data || []);

      const partner = data.find(
        (msg: any) => msg.user_id !== parseInt(user_id as string)
      );
      if (partner) setChatPartner(partner.sender_name);
    };

    loadMessages();
  }, [id, user_id]); // Add user_id as a dependency

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const sentMessage = await sendMessage(id as string, newMessage);
    if (sentMessage) {
      setMessages((prev) => [sentMessage, ...prev]);
      setNewMessage("");
    }
  };

  const renderMessage = ({ item }: any) => {
    const isUser = item.user_id === parseInt(user_id as string); // Use dynamic user_id
    return <ChatMessage item={item} isUser={isUser} />;
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "black" : "white",
      }}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        inverted
        renderItem={renderMessage}
      />

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
