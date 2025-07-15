import { API_URL } from "./config";

// fetchActivities now requires device lat/lon and user-selected radius for location-based filtering.
// The legacy 'location' string field is deprecated and will be removed from requests and responses.

export const fetchActivities = async (userId: string | number,
  location: { coords: { latitude: number; longitude: number } },
  radius?: number) => {
  if (!userId || !location?.coords) {
    throw new Error("fetchActivities requires a userId and location.coords");
  }

  const params: Record<string, string> = {
    user_id: String(userId),
    lat: String(location.coords.latitude),
    lon: String(location.coords.longitude),
  };
  if (radius !== undefined) {
    params.radius = String(radius);
    console.log(`[API] radius received: ${radius}`);
  }
  console.log(`[API] location.coords received: lat=${params.lat}, lon=${params.lon}`);

  const url = `${API_URL}/activities?${new URLSearchParams(params).toString()}`;
  try {
    const response = await fetch(url);
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

export const resetDeclinedActivities = async (userId: number) => {
  try {
    const response = await fetch(`${API_URL}/activities/reset-swipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error resetting declined activities:", error);
    return { error: true };
  }
};
