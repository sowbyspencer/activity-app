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

export const swipeActivity = async (
  userId: number,
  activityId: number,
  liked: boolean
) => {
  try {
    const response = await fetch(`${API_URL}/activities/swipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, activityId, liked }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error swiping activity:", error);
    return { error: true };
  }
};

export const leaveActivity = async (
  userId: number,
  activityId: number
) => {
  try {
    const response = await fetch(`${API_URL}/activities/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, activityId }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error leaving activity:", error);
    return { error: true };
  }
};
