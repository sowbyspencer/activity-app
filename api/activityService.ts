import { API_URL } from "./config";

export const fetchActivities = async () => {
  try {
    const response = await fetch(`${API_URL}/activities`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};
