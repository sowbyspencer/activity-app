// -----------------------------------------------------------------------------
// ThemedView.tsx - View component with theme-aware background color
// -----------------------------------------------------------------------------
// Wraps React Native View and applies background color based on current theme.
// Used for consistent theming across the app.
//
// Props:
//   - All ViewProps
//   - lightColor: override for light mode
//   - darkColor: override for dark mode
// -----------------------------------------------------------------------------

import { View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background");

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
