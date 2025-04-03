import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function FormWrapper({ children }) {
  const colorScheme = useColorScheme();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "black" : "white" },
      ]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
});
