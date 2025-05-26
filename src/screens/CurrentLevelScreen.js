import React, { useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { ActivityIndicator, FAB } from "react-native-paper";
import { useLevel } from "../context/LevelContext";
import { useTheme } from "../context/ThemeContext";
import PostScreen from "./PostScreen";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";

export default function CurrentLevelScreen() {
  const { theme } = useTheme();
  const { currentLevel, setCurrentLevel, userDetails } = useLevel();
  const [showOptions, setShowOptions] = useState(false);
  const fabPosition = new Animated.Value(30);
  const [isLoading, setIsLoading] = useState(false);


  const handleFABPress = () => {
    setShowOptions(!showOptions);
  };

  const handleLevelChange = (level) => {
    setIsLoading(true);
    setCurrentLevel(level);
    setShowOptions(false);

    // Wait briefly to simulate loading or give PostScreen time to fetch
   // setTimeout(() => setIsLoading(false), 1000); // Adjust timing as needed
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size={"small"} />
        </View>
      ) : ( */}
        <PostScreen level={currentLevel} />
      {/* )} */}

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
        color="white"
        onPress={handleFABPress}
      />

      {showOptions && (
        <View
          style={{
            position: "absolute",
            bottom: 100,
            right: 10,
            backgroundColor: theme.colors.card,
            borderRadius: 10,
            elevation: 5,
            padding: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            gap: 10,
          }}
        >
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            onPress={() => handleLevelChange({ type: "home", value: "home" })}
          >
            <Ionicons name="globe-sharp" size={18} color={"gray"} />
            <Text style={{ fontSize: 16, color: theme.colors.text }}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            onPress={() =>
              handleLevelChange({ type: "county", value: userDetails?.county })
            }
          >
            <Feather name="map" size={18} color={"gray"} />
            <Text style={{ fontSize: 16, color: theme.colors.text }}>
              County
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            onPress={() =>
              handleLevelChange({
                type: "constituency",
                value: userDetails?.constituency,
              })
            }
          >
            <FontAwesome5 name="flag" size={18} color={"gray"} />
            <Text style={{ fontSize: 16, color: theme.colors.text }}>
              Constituency
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            onPress={() =>
              handleLevelChange({ type: "ward", value: userDetails?.ward })
            }
          >
            <FontAwesome5 name="map-pin" size={18} color={"gray"} />
            <Text style={{ fontSize: 16, color: theme.colors.text }}>Ward</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
