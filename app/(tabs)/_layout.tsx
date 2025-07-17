// -----------------------------------------------------------------------------
// (tabs)/_layout.tsx - Tab navigator layout for main app screens
// -----------------------------------------------------------------------------
// This file defines the tab navigation structure for the app, including Home,
// Groups, and Settings tabs. It uses custom tab bar components and icons, and
// remounts the tab navigator on login/logout for correct state.
// -----------------------------------------------------------------------------

import { Tabs } from "expo-router";
import React from "react";
import { Platform, View, StyleSheet, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/context/AuthContext";

export default function TabLayout() {
  // Get current color scheme (light/dark)
  const colorScheme = useColorScheme();
  // Get userId from auth context to force remount on login/logout
  const { userId } = useAuth();

  return (
    <Tabs
      key={userId || "guest"} // Remount tabs when user changes
      screenOptions={{
        // Set active tab color based on theme
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false, // Hide header for all tabs
        tabBarButton: HapticTab, // Use custom tab button with haptic feedback
        tabBarBackground: TabBarBackground, // Custom background (blur, etc.)
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      {/* Groups Tab */}
      <Tabs.Screen
        name="(groups)"
        options={{
          title: "Groups",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chat.fill" color={color} />,
        }}
      />
      {/* Settings Tab */}
      <Tabs.Screen
        name="(settings)/settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="settings.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white", // Ensure background matches your app theme
  },
});
