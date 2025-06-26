import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import ProfileTabs from "./ProfileTabs";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "../services/firebase";
import { useTheme } from "../context/ThemeContext";
import { useFollow } from "../context/FollowContext";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadString,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useLevel } from "../context/LevelContext";

export default function ProfileScreen() {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { followingCount, followersCount } = useFollow();
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userDocId, setUserDocId] = useState(null); // <-- Add this
  const { currentLevel, userDetails } = useLevel();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        const q = query(collection(db, "users"), where("uid", "==", user.id));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docRef = snapshot.docs[0];
          setUserData(docRef.data());
          setUserDocId(docRef.id); // <-- Save the Firestore document ID
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [user?.id]);
  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setImage(asset.uri); // This is now all you need
        setShowModal(true);
      }
    } catch (error) {
      console.warn("Image picking failed:", error);
    }
  };

  const uploadImage = async () => {
    if (!user?.id || !image) return;
    setUploading(true);

    try {
      // Upload image to Firebase Storage
      const response = await fetch(image);
      const blob = await response.blob();
      const imageRef = ref(storage, `users/${user.id}/userImg`);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);

      // 1. Update user doc in "users"
      const userDocRef = doc(db, "users", user?.id); // Make sure you saved userDocId from the useEffect
      await updateDoc(userDocRef, { userImg: downloadURL });

      // 2. Update all matching posts in current level collection
      const q = query(
        collection(db, currentLevel.type, currentLevel.value, "posts"),
        where("uid", "==", user.id)
      );
      const snapshot = await getDocs(q);

      const updatePromises = snapshot.docs.map((docSnap) =>
        updateDoc(docSnap.ref, { userImg: downloadURL })
      );
      await Promise.all(updatePromises);

      // Update local state
      setUserData((prev) => ({ ...prev, userImg: downloadURL }));
      setImage(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error uploading profile image:", error);
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View className="flex-row items-center justify-between px-3 mt-10 ml-10">
        <View className="justify-center items-center gap-4">
          <TouchableOpacity onPress={pickMedia}>
            <Image
              source={{
                uri: image || userData?.userImg || userData?.imageUrl,
              }}
              height={80}
              width={80}
              style={{ borderRadius: 40, marginLeft: 20 }}
            />
            <Text
              style={{
                textAlign: "center",
                color: theme.colors.primary,
                fontSize: 12,
                marginLeft: 20,
              }}
            >
              Change Photo
            </Text>
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
                navigation.navigate("FollowScreen", { tab: "following" })
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

      <ProfileTabs />

      {/* Modal for preview */}
      <Modal
        animationType="slide"
        transparent
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 16,
              alignItems: "center",
              width: "80%",
            }}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: 16, marginBottom: 12 }}
            >
              Preview Image
            </Text>
            {image && (
              <Image
                source={{ uri: image }}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 75,
                  marginBottom: 16,
                }}
              />
            )}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={{
                  padding: 10,
                  backgroundColor: "#ccc",
                  borderRadius: 10,
                  marginRight: 10,
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={uploadImage}
                disabled={uploading}
                style={{
                  padding: 10,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 10,
                }}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff" }}>Okay</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
