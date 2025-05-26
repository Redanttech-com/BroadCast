import React from "react";
import { View, Text, Switch } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.mode === "dark"; // adjust according to your theme setup

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20 }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          color: theme.colors.text,
          textAlign: "center",
          marginTop: 50, // Adjusted for better visibility
        }}
      >
        Settings
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 16, color: theme.colors.text }}>
          {isDark ? "Light Theme" : "Dark Theme"}
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: "#ccc", true: "#3182CE" }}
          thumbColor={isDark ? "#fff" : "#fff"}
        />
      </View>
    </View>
  );
}
