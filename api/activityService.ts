import { API_URL } from "./config";

export const fetchActivities = async (userId: string | number) => {
  if (!userId) {
    throw new Error("fetchActivities requires a userId");
  }
  try {
    const response = await fetch(`${API_URL}/activities?user_id=${userId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};
