import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons"; // or 'react-native-vector-icons/MaterialIcons'
import { useTheme } from "../context/ThemeContext";

export default function ListEmptyComponent() {
  const {theme} = useTheme(); // Assuming you have a theme context
  return (
    <View style={styles.container}>
      <MaterialIcons name="cast" size={64} color="#ccc" />
      <Text
        style={{
          marginTop: 12,
          fontSize: 18,
          textAlign: "center",
          fontWeight: "bold",
          color: theme.colors.text, // Use theme color for text
        }}
      >
        No Cast Available
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    flex: 1,
  },
});
