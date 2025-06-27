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
  updateDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "../services/firebase";
import { useTheme } from "../context/ThemeContext";
import { useFollow } from "../context/FollowContext";
import { getDownloadURL } from "firebase/storage";
import { Ionicons } from "@expo/vector-icons";
import UserScreenTabs from "./userScreenTabs";

export default function ProfileScreen() {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const { theme } = useTheme();
  const route = useRoute();
  const [selectedFile, setSelectedFile] = useState(null);
  const [userImg, setUserImg] = useState(null);
  const { uid, media } = route.params;
  // const [followersUsers, setFollowersUsers] = useState([]);
  
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) return;
      try {
        const q = query(collection(db, "users"), where("uid", "==", uid));
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
    

  const sendUserImg = async () => {
    if (!uid) return;
    setUserLoading(true);

    try {
      const userDocRef = doc(db, "users", uid); // correct way to reference user's document
      const imageRef = ref(storage, `users/${uid}/userImg`);

      if (selectedFile) {
        await uploadString(imageRef, selectedFile, "data_url");
        const downloadURL = await getDownloadURL(imageRef);

        await updateDoc(userDocRef, {
          userImg: downloadURL,
        });

        setUserImg(downloadURL);
        setSelectedFile(null);
      } else {
        console.log("No file selected.");
      }
    } catch (error) {
      console.error("Error updating profile image: ", error);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      sendUserImg();
    }
  }, [selectedFile]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View className="flex-row  justify-between px-3 mt-10">
        <TouchableOpacity onPress={() => navigation.goBack()} >
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <View className="justify-center items-center gap-4">
          <Image
            source={{ uri: userData?.userImg || userData?.imageUrl }}
            height={80}
            width={80}
            style={{ borderRadius: 20, marginLeft: 40 }}
          />
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderRadius: 20,
              padding: 10,
              flexDirection: "row",
              gap: 2,
            }}
            onPress={() =>
              navigation.navigate("ChatRoom", {
                item: {
                  uid: uid,
                  name: userData?.name,
                  nickname: userData?.nickname,
                  imageUrl: userData?.imageUrl,
                  imageUrl: userData?.imageUrl,
                },
              })
            }
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color={theme.colors.text}
            />
            <Text style={{ color: theme.colors.text }}>Chat</Text>
          </TouchableOpacity>
        </View>
        <View className="m-4 gap-2">
          <View className="bg-blue-400 w-32 p-2 items-center rounded-full">
            <Text className="font-bold text-white text-xs">Verify Account</Text>
          </View>

          <View className="mt-4 flex-row justify-between items-center gap-4">
            <Text
              className="font-bold text-xl"
              style={{ color: theme.colors.text }}
            >
              {userData?.name}{" "}
              <Text className="ml-2" style={{ color: theme.colors.primary }}>
                @{userData?.nickname}
              </Text>
            </Text>
            <Pressable
              className="p-2 rounded-md"
              style={{ borderWidth: 1, borderColor: theme.colors.text }}
              onPress={() =>
                navigation.navigate("LocationSelectionScreen", {
                  selectedCounty: user?.location?.county || null,
                  selectedConstituency: user?.location?.constituency || null,
                  selectedWard: user?.location?.ward || null,
                  fromProfileEdit: true, // optional flag to differentiate this from initial signup
                })
              }
            >
              <Text style={{ color: theme.colors.text, fontSize: 10 }}>
                Edit profile
              </Text>
            </Pressable>
          </View>
          <View className="flex-row justify-evenly mt-2 gap-4">
            <Pressable
              onPress={() =>
                navigation.navigate("UserFollowScreen", { tab: "followers", uid: uid })
              }
              className="items-center flex-row gap-2"
            >
              <Text
                className="font-extrabold  text-xs"
                style={{ color: theme.colors.text }}
              >
                {followersCount}
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
                navigation.navigate("UserFollowScreen", { tab: "following", uid:uid })
              }
            >
              <Text
                className="font-extrabold text-sm"
                style={{ color: theme.colors.text }}
              >
                {followingCount}
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
