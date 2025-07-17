// -----------------------------------------------------------------------------
// chatService.ts - API calls for chat messaging
// -----------------------------------------------------------------------------
// Provides functions to fetch chat messages and send new messages via backend API.
// Used by chat and messaging screens.
// -----------------------------------------------------------------------------

import { API_URL } from "./config";

export const fetchChatMessages = async (chatId: string) => {
  try {
    const response = await fetch(`${API_URL}/chat/${chatId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
};

export const sendMessage = async (chatId: string, content: string, user_id: number) => {
  try {
    const response = await fetch(`${API_URL}/chat/${chatId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, user_id }), // include user_id
    });

    return await response.json(); // Return sent message
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
};
