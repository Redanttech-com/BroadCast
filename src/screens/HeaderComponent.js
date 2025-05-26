import { View, Text } from "react-native";
import React from "react";
import StatusList from "../components/StatusList/StatusList";
import { useLevel } from "../context/LevelContext";
import { useTheme } from "../context/ThemeContext";

export default function HeaderComponent() {
  const { theme } = useTheme();
  const { currentLevel } = useLevel();
  const formattedTitle =
    currentLevel?.type === "home"
      ? "Home"
      : `${
          currentLevel?.value && typeof currentLevel.value === "string"
            ? currentLevel.value.charAt(0).toUpperCase() +
              currentLevel.value.slice(1)
            : "currentLevel"
        } ${
          currentLevel?.type && typeof currentLevel.type === "string"
            ? currentLevel.type.charAt(0).toUpperCase() +
              currentLevel.type.slice(1)
            : "Level"
        }`;

  return (
    <View className="shadow-sm mt-14">
      <View className="w-full justify-center items-center">
        <Text style={{color: theme.colors.text, fontWeight: "bold", fontSize: 20}}>
          {formattedTitle}
        </Text>
      </View>
      <View style={{ minHeight: 100, shadowColor: "#000", shadowRadius: 4 }}>
        <StatusList />
      </View>
    </View>
  );
}
