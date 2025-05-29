import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, Platform } from "react-native";
import { ActivityIndicator, FAB } from "react-native-paper";
import { useLevel } from "../context/LevelContext";
import { useTheme } from "../context/ThemeContext";
import PostScreen from "./PostScreen";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";

export default function CurrentLevelScreen() {
  const { theme } = useTheme();
  const { currentLevel, setCurrentLevel, userDetails } = useLevel();
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  const toggleOptions = () => {
    if (showOptions) {
      // Hide animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 30,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowOptions(false));
    } else {
      setShowOptions(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleLevelChange = (level) => {
    setIsLoading(true);
    setCurrentLevel(level);
    toggleOptions();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PostScreen level={currentLevel} />

      <FAB
        icon="pen"
        style={{
          position: "absolute",
          bottom: 30,
          right: 10,
          backgroundColor: theme.colors.background,
          elevation: 5,
          borderRadius: 50,
        }}
        color={theme.colors.text}
        onPress={toggleOptions}
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
