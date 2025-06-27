import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTheme } from "../context/ThemeContext";
import { useLevel } from "../context/LevelContext";
import { Text } from "react-native";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useUser } from "@clerk/clerk-expo";
import { formatCount } from "../utils/format";
import { useRoute } from "@react-navigation/native";
import ProfileFollowing from "./UserScreens/ProfileFollowing";
import ProfileFollowers from "./UserScreens/ProfileFollowers";

const Tab = createMaterialTopTabNavigator();

export default function UserFollowTabs({ initialTab = "followers", uid }) {
  const { theme } = useTheme();
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!uid) return;

    const followersQuery = query(
      collection(db, "following"),
      where("followingId", "==", uid)
    );
    const unsubscribeFollowers = onSnapshot(followersQuery, (snapshot) => {
      setFollowersCount(snapshot.size);
    });

    const followingQuery = query(
      collection(db, "following"),
      where("followerId", "==", uid)
    );
    const unsubscribeFollowing = onSnapshot(followingQuery, (snapshot) => {
      setFollowingCount(snapshot.size);
    });

    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  }, [uid]);

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
        children={() => <ProfileFollowing uid={uid} />}
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
        children={() => <ProfileFollowers uid={uid} />}
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
