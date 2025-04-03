import { API_URL } from "./config";

export const fetchMatchedGroups = async (user_id: number) => {
  try {
    const response = await fetch(`${API_URL}/groups?user_id=${user_id}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};
