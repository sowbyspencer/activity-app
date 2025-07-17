// -----------------------------------------------------------------------------
// _layout.tsx - Stack navigator for authentication screens
// -----------------------------------------------------------------------------
// This file defines the stack navigation for the auth tab, including the login
// and signup screens. Custom headers are set for each screen as needed.
// -----------------------------------------------------------------------------

import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack>
      {/* Login screen (main entry) */}
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerBackVisible: false,
          headerLeft: () => null,
        }}
      />
      {/* Signup screen */}
      <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
    </Stack>
  );
}
