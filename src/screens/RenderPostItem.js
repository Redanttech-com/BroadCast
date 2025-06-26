import React, { useEffect, useRef, useState } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Share,
  Dimensions,
  FlatList,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import { useLevel } from "../context/LevelContext";
import { db } from "../services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { Link, useIsFocused, useNavigation } from "@react-navigation/native";
import { formatMoment } from "../utils/formartMoment";
import { formatCount } from "../utils/format";
import FastImage from "@d11/react-native-fast-image";
import { FlashList } from "@shopify/flash-list";
import Video from "react-native-video";

export default function RenderPostItem({ item, id }) {
  const mediaListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { theme } = useTheme();
  const { user } = useUser();
  const { currentLevel, userDetails } = useLevel();
  const navigation = useNavigation();
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [muted, setMuted] = useState(true);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const { width: screenWidth } = Dimensions.get("window");


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
  }, [likes, user?.id]); // ✅ add userDetails?.uid to dependencies

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

  //recats
  const recast = async () => {
    setLoading(true);
    if (item && user?.id && currentLevel) {
      const postData = item;
      try {
        const newPostData = {
          uid: userDetails?.uid,
          text: postData?.text,
          userImg: userDetails?.userImg || "",
          timestamp: serverTimestamp(),
          lastname: userDetails?.lastname,
          name: userDetails?.name,
          nickname: userDetails?.nickname,
          from: postData?.name,
          fromNickname: postData?.nickname,
          imageUrl: userDetails?.imageUrl,
          verified: userDetails?.verified || "",
          views: [],
          ...(postData.category && { category: postData.category }),
          ...(postData.media && { media: postData.media }),
        };

        await addDoc(
          collection(db, currentLevel?.type, currentLevel?.value, "posts"),
          newPostData
        );
      } catch (error) {
        console.error("Error reposting the post:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("No post data available to repost.");
      setLoading(false);
    }
  };



  useEffect(() => {
    if (item?.type === "video") {
      setMuted(!isFocused);
    }
  }, [isFocused, item?.type]);

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
              nickname: item.nickname,
              uid: item.uid,
            })
          }
          style={{ flex: 1 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <FastImage
              source={{ uri: item.userImg || item.imageUrl }}
              style={{
                height: 40,
                width: 40,
                borderRadius: 10,
              }}
              resizeMode="cover"
            />

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
      <Pressable
        onPress={() =>
          navigation.navigate("FullMedia", {
            media: [], // empty array for no media
            text: item.text,
            postId: item.id,
          })
        }
      >
        {item.citeInput && (
          <View
            style={{
              margin: 8,
              paddingHorizontal: 10,
              backgroundColor: theme.colors.background,
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                margin: 8,
                paddingHorizontal: 10,
                color: theme.colors.text,
              }}
              numberOfLines={4}
            >
              {item.citeInput}
            </Text>
          </View>
        )}
        <Text
          style={{
            marginBottom: 10,
            paddingHorizontal: 10,
            color: theme.colors.text,
          }}
          numberOfLines={4}
        >
          {item.text}
        </Text>
      </Pressable>

      {/* Content: Text, Image, Video */}
      {Array.isArray(item.media) && item.media.length > 1 ? (
        <>
          <FlashList
            horizontal
            estimatedItemSize={screenWidth}
            data={item.media}
            pagingEnabled
            keyExtractor={(mediaItem, index) => index.toString()}
            renderItem={({ item: mediaItem }) => (
              <Pressable
                onPress={() =>
                  navigation.navigate("FullMedia", {
                    media: item.media,
                    text: item.text,
                    postId: item.id,
                  })
                }
              >
                <View
                  style={{
                    width: screenWidth,
                    height: 400,
                  }}
                >
                  {mediaItem?.type === "image" ? (
                    <FastImage
                      source={{ uri: mediaItem.url }}
                      style={{ width: "100%", height: "100%", borderRadius: 8 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <>
                      <Video
                        source={{ uri: mediaItem.url }}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 8,
                        }}
                        resizeMode="cover"
                        muted={true}
                        repeat={true}
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
                        }}
                      />
                      
                    </>
                  )}
                </View>
              </Pressable>
            )}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / screenWidth
              );
              setCurrentIndex(index);
            }}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            {item.media.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor: index === currentIndex ? "#333" : "#ccc",
                }}
              />
            ))}
          </View>
        </>
      ) : Array.isArray(item.media) &&
        item.media.length === 1 &&
        item.media[0]?.url ? (
        <Pressable
          onPress={() =>
            navigation.navigate("FullMedia", {
              media: item.media,
              text: item.text,
              postId: item.id,
            })
          }
        >
          <View style={{ width: screenWidth, height: 400 }}>
            {item.media[0].type === "image" ? (
              <FastImage
                source={{ uri: item.media[0].url }}
                style={{ width: "100%", height: "100%", borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <>
                <Video
                  source={{ uri: item.media[0].url }}
                  style={{ width: "100%", height: "100%", borderRadius: 8 }}
                  resizeMode="cover"
                  muted={true}
                  repeat={true}
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
        </Pressable>
      ) : null}
      {item.fromUser && (
        <Text style={{ color: "gray" }}>recited from @{item.fromlastname}</Text>
      )}
      {/* Interaction Buttons */}
      <View className="flex-row items-center gap-6 p-2 justify-center ">
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
          onPress={recast}
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
