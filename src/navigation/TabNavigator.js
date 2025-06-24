import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MarketScreen from "../screens/MarketScreens/MarketScreen";
import InputScreen from "../screens/InputScreen";
import { useTheme } from "../context/ThemeContext";
import ProfileScreen from "../screens/ProfileScreen";
import CurrentLevelScreen from "../screens/CurrentLevelScreen";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLevel } from "../context/LevelContext";
import NewsScreen from "../screens/NewsScreens/NewsScreen";

import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function resetToDrawer() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: "CurrentLevel" }],
    });
  }
}

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { currentLevel, setCurrentLevel } = useLevel();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="CurrentLevel"
        component={CurrentLevelScreen}
        options={{
          tabBarLabel:
            currentLevel?.value && typeof currentLevel.value === "string"
              ? currentLevel.value.charAt(0).toUpperCase() +
                currentLevel.value.slice(1)
              : "Level",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          tabBarLabel: "Market",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Input"
        component={InputScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color, size }) => (
            <Feather name="plus-circle" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          tabBarLabel: "News",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
