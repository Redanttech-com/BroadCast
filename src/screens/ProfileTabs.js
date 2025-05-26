import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ProfileBookmarks from "./ProfileScreens/ProfileBookMarks";
import ProfileReplies from "./ProfileScreens/ProfileReplies";
import ProfilePosts from "./ProfileScreens/ProfilePosts";
import { useTheme } from "../context/ThemeContext";
import { View } from "react-native";

const Tab = createMaterialTopTabNavigator();

export default function ProfileTabs() {
  const { theme } = useTheme();
  return (
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
          tabBarIndicatorStyle: { backgroundColor: "#3182CE" },
          tabBarActiveTintColor: "#3182CE",
          tabBarInactiveTintColor: "#718096",
          tabBarStyle: {backgroundColor: theme.colors.background}
        }}
      >
        <Tab.Screen name="Posts" component={ProfilePosts} />
        <Tab.Screen name="Replies" component={ProfileReplies} />
        <Tab.Screen name="Bookmarks" component={ProfileBookmarks} />
      </Tab.Navigator>
  );
}
