// -----------------------------------------------------------------------------
// _layout.tsx - Stack navigator for the groups section
// -----------------------------------------------------------------------------
// This file defines the stack navigation for the groups tab, including the
// groups list, activity group details, and chat screens. Custom headers are set
// for each screen as needed.
// -----------------------------------------------------------------------------

import { Stack } from "expo-router";

export default function GroupsLayout() {
  return (
    <Stack>
      {/* Groups list screen (main entry) */}
      <Stack.Screen name="groups" options={{ headerShown: false }} />
      {/* Activity group details screen */}
      <Stack.Screen name="activityGroup/[id]" options={{ headerShown: true, title: "Activity Group" }} />
      {/* Chat screen (group or direct) */}
      <Stack.Screen
        name="chat/[id]"
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.activityName || route.params?.chatPartner || "Chat",
        })}
      />
    </Stack>
  );
}
