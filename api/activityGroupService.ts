// -----------------------------------------------------------------------------
// activityGroupService.ts - API calls for fetching activity group details
// -----------------------------------------------------------------------------
// Provides a function to fetch group details (members, chat, etc.) for a given activity.
// Used by group and activity detail screens.
// -----------------------------------------------------------------------------

import { API_URL } from "./config";

// fetchActivityGroup: Fetches group details for a specific activity and user
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
