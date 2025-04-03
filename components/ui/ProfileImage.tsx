import React from "react";
import { Image, StyleSheet, View } from "react-native";

export default function ProfileImage({ uri, size = 100 }) {
  return uri ? (
    <Image
      source={{ uri }}
      style={[
        styles.image,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  ) : (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: "cover",
  },
  placeholder: {
    backgroundColor: "#ccc",
  },
});
