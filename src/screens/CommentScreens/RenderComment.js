import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import { useLevel } from "../../context/LevelContext";
import { db, storage } from "../../services/firebase"; // Firebase config

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useUser } from "@clerk/clerk-expo";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { formatMoment } from "../../utils/formartMoment";
import { useTheme } from "../../context/ThemeContext";

export default function RenderComment({ item, id }) {
  const route = useRoute();

  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  // const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const [comments, setComments] = useState([]);
  const flashListRef = useRef(null);
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(
      collection(db, "comments", id, "likes"),
      (snapshot) => setLikes(snapshot.docs)
    );

    return () => unsubscribe(); // ✅ cleanup on unmount or id change
  }, [id]);

  useEffect(() => {
    setHasLiked(likes.findIndex((like) => like.id === user?.id) !== -1);
  }, [likes]);

  async function likeComment() {
    if (user?.id) {
      if (hasLiked) {
        await deleteDoc(doc(db, "comments", id, "likes", user.id));
      } else {
        await setDoc(doc(db, "comments", id, "likes", user?.id), {
          uid: user?.id,
        });
      }
    }
  }

  return (
    <>
      <View
        style={{
          // marginBottom: 5,
          backgroundColor: theme.colors.card,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {loading ? (
          <View style={{ alignItems: "center" }}>
            <ActivityIndicator size="small" color={theme.colors.text} />
          </View>
        ) : (
          <>
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
                  })
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {item.imageUrl && (
                    <Image
                      source={{
                        uri:
                          typeof item.imageUrl === "string"
                            ? item.imageUrl
                            : item.imageUrl?.toString(),
                      }}
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 10,
                        borderWidth: 1,
                      }}
                      resizeMode="cover"
                    />
                  )}
                  <Text
                    style={{
                      marginTop: 8,
                      marginBottom: 10,
                      color: theme.colors.text,
                      fontSize: 12,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      marginBottom: 10,
                      color: theme.colors.text,
                      fontSize: 12,
                    }}
                  >
                    {item.lastname}
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      marginBottom: 10,
                      color: theme.colors.primary,
                      fontSize: 12,
                    }}
                  >
                    @{item.nickname}
                  </Text>
                </View>
              </TouchableOpacity>
              <View className="mr-2">
                <Text style={{ color: theme.colors.text }}>
                  {formatMoment(item?.timestamp)}
                </Text>
              </View>

              <TouchableOpacity
                style={{ flexDirection: "row", gap: 10 }}
                onPress={() =>
                  navigation.navigate("OptionScreen", {
                    postId: item.id,
                    post: item,
                  })
                }
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
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("FullImageScreen", {
                  image: item.images,
                  text: item.comment,
                })
              }
            >
              <Text
                style={{
                  marginTop: 8,
                  marginBottom: 10,
                  marginHorizontal: 10,
                  color: theme.colors.text,
                }}
              >
                {item.comment}
              </Text>
              {item.images && (
                <Image
                  source={
                    typeof item.images === "string"
                      ? { uri: item.images }
                      : item.images
                  }
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
              )}
              {item.video && (
                <View
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <Video
                    source={{ uri: item.video }}
                    resizeMode="cover"
                    shouldPlay={false}
                    isMuted={item.muted}
                    style={{ width: "100%", height: "100%" }}
                  />
                  <TouchableOpacity
                    onPress={() => toggleMute(item.id)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: "blue",
                      padding: 5,
                      borderRadius: 50,
                    }}
                  >
                    <Ionicons
                      name={item.muted ? "volume-mute" : "volume-high"}
                      size={24}
                      color={{ color: theme.colors.text }}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
            <View className="flex-row items-center gap-10 p-2 justify-center">
              <TouchableOpacity style={styles.container} onPress={likeComment}>
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
                      fontSize: 14,
                      color: theme.colors.text,
                    }}
                  >
                    {likes.length}
                  </Text>
                )}
              </TouchableOpacity>

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

              {/* Recite button */}
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
                  name="comment-quote-outline" // Use 'microphone-outline' if it fits better
                  size={18}
                  color={theme.colors.text}
                />
              </TouchableOpacity>

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

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  padding: 4,
                }}
              >
                <Ionicons
                  name="eye-outline"
                  size={18}
                  color={theme.colors.text}
                />
                <Text style={{ color: theme.colors.text }}>{item.views}</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </>
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
