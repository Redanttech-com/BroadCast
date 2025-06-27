import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTheme } from "../context/ThemeContext";
import { View } from "react-native";
import ProfilePosts from "./UserScreens/ProfilePosts";
import ProfileReplies from "./UserScreens/ProfileReplies";
import ProfileBookmarks from "./UserScreens/ProfileBookMarks";
import { useRoute } from "@react-navigation/native";

const Tab = createMaterialTopTabNavigator();

export default function UserScreenTabs() {
  const route = useRoute();
  const { uid } = route.params; // Get the user ID from route params
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "#3182CE" },
        tabBarActiveTintColor: "#3182CE",
        tabBarInactiveTintColor: "#718096",
        tabBarStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tab.Screen
        name="Posts"
        component={ProfilePosts}
        initialParams={{ uid }}
      />
      <Tab.Screen
        name="Replies"
        component={ProfileReplies}
        initialParams={{ uid }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={ProfileBookmarks}
        initialParams={{ uid }}
      />
    </Tab.Navigator>
  );
}
