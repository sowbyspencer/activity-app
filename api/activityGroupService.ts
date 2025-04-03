import { API_URL } from "./config";

export const fetchActivityGroup = async (activity_id: number, user_id: number) => {
  try {
    const response = await fetch(
      `${API_URL}/activityGroup/${activity_id}?user_id=${user_id}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching activity group:", error);
    return [];
  }
};
