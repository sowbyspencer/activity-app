import { Stack } from "expo-router";

export default function GroupsLayout() {
  return (
    <Stack>
      <Stack.Screen name="groups" options={{ headerShown: false }} />
      <Stack.Screen
        name="activityGroup/[id]"
        options={{ headerShown: true, title: "Activity Group" }}
      />
      <Stack.Screen
        name="chat/[id]"
        options={({ route }) => ({
          headerShown: true,
          title:
            route.params?.activityName || route.params?.chatPartner || "Chat",
        })}
      />
    </Stack>
  );
}
