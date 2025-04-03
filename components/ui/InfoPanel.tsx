import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function InfoPanel({ activity }) {
  const colorScheme = useColorScheme();

  return (
    // Content Wrapper
    <View style={styles.contentWrapper}>
      {/* Info Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.text,
            { color: colorScheme === "dark" ? "white" : "black" },
          ]}
        >
          {activity.description || "No description available."}
        </Text>
        {activity.location && (
          <Text
            style={[
              styles.text,
              { color: colorScheme === "dark" ? "white" : "black" },
            ]}
          >
            📍 Location: {activity.location}
          </Text>
        )}
        <Text
          style={[
            styles.text,
            { color: colorScheme === "dark" ? "white" : "black" },
          ]}
        >
          💰 Cost: {activity.has_cost ? `$${activity.cost}` : "Free"}
        </Text>
        <Text
          style={[
            styles.text,
            { color: colorScheme === "dark" ? "white" : "black" },
          ]}
        >
          🗓 Available:
          {activity.available_sun ? " Sun" : ""}
          {activity.available_mon ? " Mon" : ""}
          {activity.available_tue ? " Tue" : ""}
          {activity.available_wed ? " Wed" : ""}
          {activity.available_thu ? " Thu" : ""}
          {activity.available_fri ? " Fri" : ""}
          {activity.available_sat ? " Sat" : ""}
        </Text>
        {activity.url && (
          <TouchableOpacity onPress={() => Linking.openURL(activity.url)}>
            <Text
              style={[
                styles.linkText,
                { color: colorScheme === "dark" ? "lightblue" : "blue" },
              ]}
            >
              🔗 {activity.url}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  text: { marginBottom: 10 },
  contentWrapper: {
    flex: 1,
    padding: 20,
  },
  linkText: {
    color: "lightblue",
    marginTop: 10,
  },
});
