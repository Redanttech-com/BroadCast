import React, { useState, useEffect } from "react";
import { View, Text, Image, Pressable, TouchableOpacity } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useNavigation, useRoute } from "@react-navigation/native";
import ProfileTabs from "./ProfileTabs"; // Import the top tabs
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import UserScreenTabs from "./userScreenTabs";
import { useLevel } from "../context/LevelContext";

export default function UserScreen() {
  const route = useRoute();
  const { uid } = route.params;
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { currentLevel } = useLevel();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) return;
      try {
        const q = query(collection(db, "userPosts"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setUserData(snapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, [uid]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 40,
          right: 20,
          zIndex: 2,
          backgroundColor: "rgba(0,0,0,0.6)",
          padding: 5,
          borderRadius: 50,
        }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>
      <View className="flex-row items-center justify-between px-3 mt-20">
        <View className="justify-center items-center gap-4">
          <Image
            source={{ uri: userData?.userImg || userData?.imageUrl }}
            height={80}
            width={80}
            style={{ borderRadius: 20, marginLeft: 40 }}
          />
          <View className="bg-blue-400 w-32 p-2 items-center rounded-full">
            <Text className="font-bold text-white text-xs">Verify Account</Text>
          </View>
        </View>

        <View className="m-4 gap-2">
          <View className="mt-4 flex-row justify-between items-center gap-4">
            <Text
              className="font-bold text-xl"
              style={{ color: theme.colors.text }}
            >
              {userData?.name}
            </Text>
            <Pressable
              className="p-2 rounded-md"
              style={{ borderWidth: 1, borderColor: theme.colors.text }}
              onPress={() => navigation.navigate("LocationSelectionScreen")}
            >
              <Text style={{ color: theme.colors.text, fontSize: 10 }}>
                Edit profile
              </Text>
            </Pressable>
          </View>
          <View className="flex-row justify-evenly mt-2 gap-4">
            <Pressable
              onPress={() =>
                navigation.navigate("FollowScreen", { tab: "followers" })
              }
              className="items-center flex-row gap-2"
            >
              <Text
                className="font-extrabold  text-xs"
                style={{ color: theme.colors.text }}
              >
                1
              </Text>

              <Text className=" text-sm" style={{ color: theme.colors.text }}>
                Followers
              </Text>
            </Pressable>
            <View>
              <Text style={{ color: theme.colors.text }}>|</Text>
            </View>
            <Pressable
              className="items-center flex-row gap-2"
              onPress={() =>
                navigation.navigate("FollowScreen", { tab: "following" })
              }
            >
              <Text
                className="font-extrabold text-sm"
                style={{ color: theme.colors.text }}
              >
                1
              </Text>
              <Text className=" text-sm" style={{ color: theme.colors.text }}>
                Following
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      <UserScreenTabs />
    </View>
  );
}
