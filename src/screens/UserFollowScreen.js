import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useLevel } from "../context/LevelContext";
import UserFollowTabs from "./UserFollowTabs";

export default function UserFollowScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const initialTab =
    route.params?.tab === "following" ? "Following" : "Followers";
  const uid = route.params?.uid || null;
  
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(
    initialTab === "following" ? "Following" : "Followers"
  );

  // Listen to tab changes using navigation events
  useEffect(() => {
    const unsubscribe = navigation.addListener("state", (e) => {
      const routeNames = e.data.state?.routes;
      const currentTab = routeNames?.[e.data.state.index]?.name;
      if (currentTab && currentTab !== activeTab) {
        setActiveTab(currentTab);
      }
    });

    return unsubscribe;
  }, [navigation, activeTab]);
  
  if (!uid) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text style={{ color: theme.colors.text }}>No user ID provided.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View className="w-full flex-row justify-center items-center mb-4 mt-10 px-4">
        <Text
          className="font-bold text-2xl  text-center flex-1"
          style={{ color: theme.colors.text }}
        >
          Members
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="ml-auto"
        >
          <Ionicons name="close" size={32} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <UserFollowTabs initialTab={initialTab} uid={uid} />
    </View>
  );
}
