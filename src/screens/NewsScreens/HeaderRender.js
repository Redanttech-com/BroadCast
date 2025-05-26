import { View, Text } from "react-native";
import React from "react";
import { useLevel } from "../../context/LevelContext";
import { useTheme } from "../../context/ThemeContext";

export default function HeaderRender() {
  const { currentLevel } = useLevel();
  const { theme } = useTheme();

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
    <View className="shadow-sm mt-16">
      <View className="w-full justify-center items-center">
        <Text
          style={{
            fontWeight: "bold",
            textAlign: "center",
            color: theme.colors.text,
            fontSize: 20,
          }}
        >
          {formattedTitle} News
        </Text>
      </View>
    </View>
  );
}
