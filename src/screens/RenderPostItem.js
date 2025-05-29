import React, { useEffect, useRef, useState } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Video } from "expo-av";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Share,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import { useLevel } from "../context/LevelContext";
import { db } from "../services/firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { formatMoment } from "../utils/formartMoment";
import { formatCount } from "../utils/format";

export default function RenderPostItem({ item, id}) {
  const { theme } = useTheme();
  const { user } = useUser();
  const { currentLevel } = useLevel();
  const navigation = useNavigation();
  const [mutedMap, setMutedMap] = useState({});
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [muted, setMuted] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(
      collection(db, "likes", id, "likes"),
      (snapshot) => setLikes(snapshot.docs)
    );

    return () => unsubscribe(); // ✅ cleanup on unmount or id change
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(
      collection(db, "comments", id, "comments"),
      (snapshot) => setComments(snapshot.docs)
    );

    return () => unsubscribe(); // ✅ cleanup on unmount or id change
  }, [id]);

  useEffect(() => {
    if (user?.id) {
      setHasLiked(likes.findIndex((like) => like.id === user.id) !== -1);
    }
  }, [likes, user?.id]); // ✅ add userData?.uid to dependencies

  async function likePost() {
    if (user?.id) {
      if (hasLiked) {
        await deleteDoc(doc(db, "likes", id, "likes", user?.id));
      } else {
        await setDoc(doc(db, "likes", id, "likes", user?.id), {
          uid: user?.id,
        });
      }
    }
  }

  useEffect(() => {
    if (item?.type === "video") {
      setMuted(!isFocused);
    }
  }, [isFocused, item?.type]);

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  // const videoRef = useRef(null);

  // useEffect(() => {
  //   if (videoRef.current) {
  //     if (isVisible) {
  //       videoRef.current.playAsync();
  //     } else {
  //       videoRef.current.pauseAsync();
  //       videoRef.current.setIsMutedAsync(true); // Optional mute
  //     }
  //   }
  // }, [isVisible]);

  const handleShare = async (text) => {
    try {
      const result = await Share.share({
        message: `Check this Cast: https://yourappdomain.com/fullImageScreen/${item.id}`,
        url: `https://yourappdomain.com/fullImageScreen/${item.id}`,
      });

      // Optional: handle the user's action
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      Alert.alert("Error", "Unable to share content.");
    }
  };

  return (
    <View
      style={{
        marginBottom: 1,
        backgroundColor: item.report ? "#1c1c1c" : theme.colors.card,
        borderRadius: 10,
        shadowColor: "#000",
        shadowRadius: 4,
        elevation: 2,
        position: "relative",
      }}
    >
      {item.report && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 50,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 16,
              textAlign: "center",
              padding: 10,
            }}
          >
            ⚠️ This Cast is reported
          </Text>
        </View>
      )}

      {/* Header: Avatar + Name */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("UserScreen", {
              name: item.name,
              image: item.imageUrl,
              uid: item.uid,
            })
          }
          style={{ flex: 1 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 10,
                }}
                resizeMode="cover"
              />
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  fontWeight: "bold",
                }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  color: theme.colors.text + "99", // Slightly lighter
                  fontSize: 12,
                }}
                numberOfLines={1}
              >
                @{item.nickname}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={{ color: theme.colors.text, fontSize: 12, zIndex: 50 }}>
          {formatMoment(item?.timestamp)}
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("OptionScreen", {
              pstId: item.id,
              userId: item.uid,
              post: item,
            })
          }
          style={{ zIndex: 60 }}
        >
          <Feather
            name="more-vertical"
            size={24}
            color="gray"
            style={{
              padding: 4,
              borderRadius: 50,
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Content: Text, Image, Video */}
      <Pressable
        onPress={() =>
          navigation.navigate("FullImageScreen", {
            image: item.images,
            video: item.videos,
            text: item.text,
            pstId: item.id,
          })
        }
      >
        <Text
          style={{
            marginTop: 8,
            marginBottom: 10,
            paddingHorizontal: 10,
            color: theme.colors.text,
          }}
        >
          {item.text}
        </Text>

        {item.images && (
          <View style={{ position: "relative" }}>
            <Image
              source={
                typeof item.images === "string"
                  ? { uri: item.images }
                  : item.images
              }
              style={{
                width: "100%",
                height: 400,
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
          </View>
        )}

        {item.videos && (
          <View style={{ position: "relative" }}>
            <Video
              // ref={videoRef}
              source={{ uri: item.videos }}
              resizeMode="cover"
              isMuted={muted}
              style={{
                width: "100%",
                height: 400,
                borderRadius: 8,
              }}
              isLooping={true}
              shouldPlay={isFocused}
            />
            <TouchableOpacity
              onPress={toggleMute}
              style={{
                position: "absolute",
                top: 20,
                right: 10,
                backgroundColor: theme.colors.background + 99,
                padding: 5,
                borderRadius: 50,
                zIndex: 20,
              }}
            >
              <Ionicons
                name={muted ? "volume-mute" : "volume-high"}
                size={18}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        )}
      </Pressable>

      {/* Interaction Buttons */}
      <View className="flex-row items-center gap-6 p-2 justify-center">
        <TouchableOpacity style={styles.container} onPress={likePost}>
          <AntDesign
            name="heart"
            size={18}
            color={hasLiked ? "red" : theme.colors.text}
          />
          {likes.length > 0 && (
            <Text
              style={{
                position: "absolute",
                right: -5,
                fontSize: 12,
                color: theme.colors.text,
              }}
            >
              {likes.length}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate("CommentScreen", {
              postId: item.id,
            });
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            padding: 4,
          }}
        >
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color={theme.colors.text}
          />
          <Text style={{ color: theme.colors.text, fontSize: 12 }}>
            {comments.length === 0 ? " " : formatCount(comments.length)}
          </Text>
        </TouchableOpacity>

        {/* Repost */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            padding: 4,
          }}
        >
          <MaterialCommunityIcons
            name="repeat"
            size={18}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        {/* Recite */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ReciteScreen", {
              postId: item.id,
              post: item,
            })
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            padding: 4,
          }}
        >
          <MaterialCommunityIcons
            name="comment-quote-outline"
            size={18}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          onPress={() => handleShare(item.text)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            padding: 4,
          }}
        >
          <Feather name="share" size={18} color={theme.colors.text} />
        </TouchableOpacity>

        {/* Views */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            padding: 4,
          }}
        >
          <Ionicons name="eye-outline" size={18} color={theme.colors.text} />
          <Text style={{ color: theme.colors.text }}>
            {item.viewCount ?? ""}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  burstHeart: {
    position: "absolute",
  },
});
