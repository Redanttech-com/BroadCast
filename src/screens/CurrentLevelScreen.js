import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, Platform } from "react-native";
import { ActivityIndicator, FAB } from "react-native-paper";
import { useLevel } from "../context/LevelContext";
import { useTheme } from "../context/ThemeContext";
import PostScreen from "./PostScreen";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { FloatingAction } from "react-native-floating-action";

export default function CurrentLevelScreen() {
  const { theme } = useTheme();
  const { currentLevel, setCurrentLevel, userDetails } = useLevel();
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  const actions = [
    {
      text: "Home",
      icon: <Ionicons name="earth-outline" size={20} color="#fff" />,
      name: "home",
      position: 0,
      color: "#1F2937",
      textStyle: { color: "#fff" },
      textBackground: "#1F2937",
    },
    {
      text: "County",
      icon: <Feather name="map" size={20} color="#fff" />,
      name: "county",
      position: 1,
      color: "#1F2937",
      textStyle: { color: "#fff" },
      textBackground: "#1F2937",
    },
    {
      text: "Constituency",
      icon: <FontAwesome5 name="flag" size={20} color="#fff" />,
      name: "constituency",
      position: 2,
      color: "#1F2937",
      textStyle: { color: "#fff" },
      textBackground: "#1F2937",
    },
    {
      text: "Ward",
      icon: <FontAwesome5 name="map-pin" size={20} color="#fff" />,
      name: "ward",
      position: 3,
      color: "#1F2937",
      textStyle: { color: "#fff" },
      textBackground: "#1F2937",
    },
  ];

  const handleLevelChange = (name) => {
    switch (name) {
      case "home":
        setCurrentLevel({ type: "home", value: "home" });
        break;
      case "county":
        setCurrentLevel({ type: "county", value: userDetails?.county });
        break;
      case "constituency":
        setCurrentLevel({
          type: "constituency",
          value: userDetails?.constituency,
        });
        break;
      case "ward":
        setCurrentLevel({ type: "ward", value: userDetails?.ward });
        break;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PostScreen key={`${currentLevel.type}-${currentLevel.value}`} />
      <FloatingAction
        actions={actions}
        onPressItem={handleLevelChange}
        color={theme.colors.primary}
        overlayColor="rgba(0,0,0,0.7)"
        floatingIcon={<Feather name="more-vertical" size={24} color="#fff" />}
        distanceToEdge={{ vertical: 20, horizontal: 10 }}
      />

      {showOptions && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 100,
            right: 10,
            backgroundColor: theme.colors.card,
            borderRadius: 10,
            elevation: 10,
            padding: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            gap: 10,
            opacity,
            transform: [{ translateY }],
          }}
        >
          <OptionButton
            icon={<Ionicons name="globe-sharp" size={18} color={"gray"} />}
            label="Home"
            onPress={() => handleLevelChange({ type: "home", value: "home" })}
            textColor={theme.colors.text}
          />
          <OptionButton
            icon={<Feather name="map" size={18} color={"gray"} />}
            label="County"
            onPress={() =>
              handleLevelChange({ type: "county", value: userDetails?.county })
            }
            textColor={theme.colors.text}
          />
          <OptionButton
            icon={<FontAwesome5 name="flag" size={18} color={"gray"} />}
            label="Constituency"
            onPress={() =>
              handleLevelChange({
                type: "constituency",
                value: userDetails?.constituency,
              })
            }
            textColor={theme.colors.text}
          />
          <OptionButton
            icon={<FontAwesome5 name="map-pin" size={18} color={"gray"} />}
            label="Ward"
            onPress={() =>
              handleLevelChange({ type: "ward", value: userDetails?.ward })
            }
            textColor={theme.colors.text}
          />
        </Animated.View>
      )}
    </View>
  );
}

// 🧱 Reusable option button
const OptionButton = ({ icon, label, onPress, textColor }) => (
  <TouchableOpacity
    style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
    onPress={onPress}
  >
    {icon}
    <Text style={{ fontSize: 16, color: textColor }}>{label}</Text>
  </TouchableOpacity>
);
