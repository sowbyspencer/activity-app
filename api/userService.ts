import { API_URL } from "./config";

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
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: "PUT",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to update user profile");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating user profile:", error);
        return null;
    }
};
