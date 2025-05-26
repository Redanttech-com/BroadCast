import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ProfileFollowing from "./ProfileScreens/ProfileFollowing";
import ProfileFollowers from "./ProfileScreens/ProfileFollowers";
import { useTheme } from "../context/ThemeContext";

const Tab = createMaterialTopTabNavigator();

export default function ProfileFollowTabs({ initialTab = "followers" }) {
  const {theme} = useTheme()
  return (
    <Tab.Navigator
      initialRouteName={initialTab === "following" ? "Following" : "Followers"}
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "#3182CE" },
        tabBarActiveTintColor: "#3182CE",
        tabBarInactiveTintColor: "#718096",
        tabBarStyle: {backgroundColor: theme.colors.background}
      }}
    >
      <Tab.Screen name="Following" component={ProfileFollowing} />
      <Tab.Screen name="Followers" component={ProfileFollowers} />
    </Tab.Navigator>
  );
}
