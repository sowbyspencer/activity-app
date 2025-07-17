/**
 * IndexRedirect
 *
 * This file serves as the entry point for the app. It immediately redirects users to the login screen.
 *
 * Usage:
 *   - When the app is opened at the root path, users are redirected to `/auth/login`.
 */

import { Redirect } from "expo-router";

export default function IndexRedirect() {
  // Redirect to login page on app start
  return <Redirect href="/auth/login" />;
}
