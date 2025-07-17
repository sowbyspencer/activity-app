// -----------------------------------------------------------------------------
// _layout.tsx - Root layout for the app, sets up providers and navigation stack
// -----------------------------------------------------------------------------
// This file configures the main app layout, including theme, authentication,
// location, and radius providers. It also sets up the navigation stack and
// handles splash screen and font loading. All main screens and their headers
// are registered here.
// -----------------------------------------------------------------------------

import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LocationProvider } from "@/context/LocationContext";
import { RadiusProvider } from "@/context/RadiusContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Get current color scheme (light/dark)
  const colorScheme = useColorScheme();
  // Get current user ID from auth context
  const { userId } = useAuth();
  // Load custom fonts
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Don't render app until fonts are loaded
  if (!loaded) {
    return null;
  }

  return (
    // GestureHandlerRootView is required for gesture support
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Provide authentication context to all children */}
      <AuthProvider>
        {/* Provide location context to all children */}
        <LocationProvider>
          {/* Provide radius context to all children */}
          <RadiusProvider>
            {/* Set theme based on color scheme */}
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              {/* Set status bar style and color */}
              <StatusBar
                backgroundColor={colorScheme === "dark" ? "black" : "transparent"}
                barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
              />
              {/* Force remount of navigation stack when userId changes */}
              <Stack key={userId || "guest"}>
                {/* Hide header for the entire auth route group */}
                <Stack.Screen name="auth" options={{ headerShown: false }} />

                {/* Login Page (Initial Screen) */}
                <Stack.Screen name="auth/login" options={{ headerShown: false }} />

                {/* Tabs (Main Screens) */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                {/* Profile Screen with Custom Header */}
                <Stack.Screen name="profile" options={{ headerShown: true, title: "My Profile" }} />

                {/* My Activities Screen with Custom Header */}
                <Stack.Screen name="activity/myActivities" options={{ headerShown: true, title: "My Activities" }} />

                {/* Activity Info Screen with Custom Header */}
                <Stack.Screen
                  name="activityInfo"
                  options={({ route }) => {
                    // Set header title to activity name if available
                    const title = (route.params && (route.params as any).activity && (route.params as any).activity.name) || "Activity Info";
                    return {
                      title,
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: colorScheme === "dark" ? "#222" : "#f5f5f5",
                      },
                      headerBackTitleVisible: false,
                      presentation: "transparentModal",
                      animation: "fade",
                    };
                  }}
                />

                {/* Edit Activity Screen with Custom Header */}
                <Stack.Screen
                  name="activity/edit"
                  options={{
                    headerShown: true,
                    title: "Edit Activity",
                  }}
                />

                {/* Create Activity Screen with Custom Header */}
                <Stack.Screen
                  name="activity/create"
                  options={{
                    headerShown: true,
                    title: "Create Activity",
                  }}
                />

                {/* Not Found Screen */}
                <Stack.Screen name="+not-found" />
              </Stack>
            </ThemeProvider>
          </RadiusProvider>
        </LocationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
