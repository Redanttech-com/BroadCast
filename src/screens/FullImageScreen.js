import React, { useState, useRef, useEffect } from "react";
import { View, Image, TouchableOpacity, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Video from "react-native-video";
import { db } from "../services/firebase";
import { useLevel } from "../context/LevelContext";
import { useUser } from "@clerk/clerk-expo";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../context/ThemeContext";

const FullImageScreen = ({ route, navigation }) => {
  const { image, video, text, pstId } = route.params;
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const { currentLevel } = useLevel();
  const { user } = useUser();

  const imageSource =
    typeof image === "string"
      ? { uri: image }
      : typeof image === "number"
      ? image
      : null;

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  useEffect(() => {
    if (!pstId || !user?.id || !currentLevel?.type || !currentLevel?.value)
      return;

    const fetchPost = async () => {
      try {
        const postRef = doc(
          db,
          currentLevel.type,
          currentLevel.value,
          "posts",
          pstId
        );

        // Check if post actually exists
        const postSnap = await getDoc(postRef);
        if (!postSnap.exists()) {
          return;
        }

        const viewRef = doc(postRef, "views", user.id);
        const viewSnap = await getDoc(viewRef);

        if (!viewSnap.exists()) {
          await setDoc(viewRef, {
            userId: user.id,
            timestamp: Timestamp.now(),
          });

          const viewsCollection = collection(postRef, "views");
          const snapshot = await getCountFromServer(viewsCollection);
          const count = snapshot.data().count;

          await updateDoc(postRef, {
            viewCount: count,
          });
        }
      } catch (error) {
        console.error("Error tracking post view:", error);
      }
    };

    fetchPost();
  }, [pstId, user?.id, currentLevel]);
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Close Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 40,
          left: 20,
          zIndex: 2,
          backgroundColor: "rgba(0,0,0,0.6)",
          padding: 5,
          borderRadius: 50,
        }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>

      {/* Video */}
      {video ? (
        <>
          <Video
            ref={videoRef}
            source={{ uri: video }}
            resizeMode="contain"
            shouldPlay
            isLooping
            isMuted={muted}
            style={{ flex: 1, width: "100%" }} // flex 1 to fill
          />
          <TouchableOpacity
            onPress={toggleMute}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: 5,
              borderRadius: 50,
              zIndex: 3,
            }}
          >
            <Ionicons
              name={muted ? "volume-mute" : "volume-high"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </>
      ) : image ? (
        // Image fills screen
        <Image
          source={imageSource}
          style={{ flex: 1, width: "100%", resizeMode: "contain" }}
        />
      ) : text ? (
        // Text only - center vertically and horizontally
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 18,
                textAlign: "center",
                lineHeight: 28,
              }}
            >
              {text}
            </Text>
          </ScrollView>
        </View>
      ) : null}

      {/* Overlay text for image/video */}
      {text && (image || video) && (
        <View
          style={{
            position: "absolute",
            bottom: 60,
            left: 0,
            right: 0,
            maxHeight: "40%",
            // backgroundColor: theme.colors.card,
            borderRadius: 8,
            padding: 10,
            zIndex: 2,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text
              style={{ color: theme.colors.text, fontSize: 16, lineHeight: 24 }}
            >
              {text}
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default FullImageScreen;
