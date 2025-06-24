import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ProfileFollowing from "./ProfileScreens/ProfileFollowing";
import ProfileFollowers from "./ProfileScreens/ProfileFollowers";
import { useTheme } from "../context/ThemeContext";
import { useLevel } from "../context/LevelContext";
import { Text } from "react-native";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useUser } from "@clerk/clerk-expo";
import { formatCount } from "../utils/format";

const Tab = createMaterialTopTabNavigator();

export default function ProfileFollowTabs({ initialTab = "followers" }) {
  const { theme } = useTheme();

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;

    const followersQuery = query(
      collection(db, "following"),
      where("followingId", "==", user.id)
    );
    const unsubscribeFollowers = onSnapshot(followersQuery, (snapshot) => {
      setFollowersCount(snapshot.size);
    });

    const followingQuery = query(
      collection(db, "following"),
      where("followerId", "==", user.id)
    );
    const unsubscribeFollowing = onSnapshot(followingQuery, (snapshot) => {
      setFollowingCount(snapshot.size);
    });

    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  }, [user?.id]);

  return (
    <Tab.Navigator
      initialRouteName={initialTab === "following" ? "Following" : "Followers"}
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "#3182CE" },
        tabBarActiveTintColor: "#3182CE",
        tabBarInactiveTintColor: "#718096",
        tabBarStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tab.Screen
        name="Following"
        component={ProfileFollowing}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ color, fontWeight: focused ? "bold" : "normal" }}>
              Following ({formatCount(followingCount) || 0})
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Followers"
        component={ProfileFollowers}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ color, fontWeight: focused ? "bold" : "normal" }}>
              Followers ({formatCount(followersCount) || 0})
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
