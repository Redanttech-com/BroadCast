import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import { useLevel } from "../../context/LevelContext";
import { db } from "../../services/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { useUser } from "@clerk/clerk-expo";
import { formatMoment } from "../../utils/formartMoment";
import { useTheme } from "../../context/ThemeContext";
import FastImage from "@d11/react-native-fast-image";
import { formatCount } from "../../utils/format";
import Video from "react-native-video";

export default function RenderComment({ item, id }) {
  const { user } = useUser();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const toggleMute = () => setMuted((prev) => !prev);
  const route = useRoute();
  const { postId } = route.params;

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(
      collection(db, "comments", id, "likes"),
      (snapshot) => setLikes(snapshot.docs)
    );

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    setHasLiked(likes.findIndex((like) => like.id === user?.id) !== -1);
  }, [likes]);

  const likeComment = async () => {
    if (!user?.id) return;
    if (hasLiked) {
      await deleteDoc(doc(db, "comments", id, "likes", user.id));
    } else {
      await setDoc(doc(db, "comments", id, "likes", user.id), {
        uid: user.id,
      });
    }
  };

  return (
    <View
      style={{
        marginBottom: 2,
        backgroundColor: item.report ? "#1c1c1c" : theme.colors.card,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        padding: 10,
      }}
    >
      {loading ? (
        <View style={{ alignItems: "center" }}>
          <ActivityIndicator size="small" color={theme.colors.text} />
        </View>
      ) : (
        <>
          {/* Header Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UserScreen", {
                  name: item.name,
                  image: item.imageUrl,
                })
              }
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <FastImage
                source={{ uri: item?.imageUrl || item?.userImg }}
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 10,
                  borderWidth: 1,
                }}
                resizeMode="cover"
              />
              <View style={{ marginLeft: 8 }}>
                <Text style={{ color: theme.colors.text, fontSize: 12 }}>
                  {item.name} {item.lastname}
                </Text>
                <Text style={{ color: theme.colors.primary, fontSize: 12 }}>
                  @{item.nickname}
                </Text>
              </View>
            </TouchableOpacity>

            <Text
              style={{ color: theme.colors.text, fontSize: 10, marginRight: 6 }}
            >
              {formatMoment(item?.timestamp)}
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("OptionScreen", {
                  postId: postId,
                  commentId: id,
                  post: item,
                  commentUid: item.uid,
                })
              }
            >
              <Feather name="more-vertical" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Comment Text + Like Button Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
              marginBottom: 10,
            }}
          >
            {item.comment && (
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  flex: 1,
                  flexWrap: "wrap",
                  marginRight: 8,
                }}
              >
                {item.comment}
              </Text>
            )}

            <TouchableOpacity style={styles.likeButton} onPress={likeComment}>
              <AntDesign
                name="heart"
                size={18}
                color={hasLiked ? "red" : theme.colors.text}
              />
              {likes.length > 0 && (
                <Text style={[styles.likeCount, { color: theme.colors.text }]}>
                  {formatCount(likes.length)}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Media Display */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("FullMedia", {
                media: item?.media ? [item.media] : [], // ✅ always an array
                text: item.comment,
              })
            }
          >
            {item?.media?.url && (
              <View
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                {item?.media?.type === "image" ? (
                  <FastImage
                    source={{ uri: item.media?.url }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <>
                    <Video
                      source={{ uri: item.media?.url }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                      muted
                      repeat
                      paused={false}
                    />
                    <Ionicons
                      name="play-circle-outline"
                      size={64}
                      color="white"
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: [{ translateX: -32 }, { translateY: -32 }],
                        zIndex: 10,
                      }}
                    />
                  </>
                )}
              </View>
            )}
          </TouchableOpacity>
          {/* Like Button Row */}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
    padding: 6,
    width: 50,
    height: 30,
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
  },
});
