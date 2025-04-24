import { API_URL } from "./config";
import { Platform } from "react-native";

export const fetchUserProfile = async (userId: number) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch user profile");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const updateUserProfile = async (userId: number, formData: FormData) => {
    try {
        console.log("Sending request to update user profile:", { userId, formData });

        const options: RequestInit = {
            method: "PUT",
            body: formData,
        };

        // Ensure headers are not set for FormData
        if (Platform.OS === "web") {
            delete options.headers;
        } else {
            options.headers = {
                Accept: "application/json",
            };
        }

        const response = await fetch(`${API_URL}/users/${userId}`, options);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to update user profile:", response.status, errorText);
            throw new Error("Failed to update user profile");
        }

        const data = await response.json();
        console.log("User profile updated successfully:", data);
        return data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        return null;
    }
};
