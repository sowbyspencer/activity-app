import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { userId } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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

          {/* Not Found Screen */}
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
