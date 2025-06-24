import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { listenToMediaPosts } from "../services/firestore";
import { useLevel } from "../context/LevelContext";
import { Video } from "expo-av";
import { useTheme } from "../context/ThemeContext";
import { ActivityIndicator } from "react-native-paper";
import FastImage from "@d11/react-native-fast-image";
import { db } from "../services/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;
const itemSize = screenWidth / 3 - 4;

export default function MediaScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const { currentLevel } = useLevel();
  const { theme } = useTheme();
  const navigation = useNavigation();
  useEffect(() => {
    if (!currentLevel?.type || !currentLevel?.value) return;

    const q = query(
      collection(db, currentLevel.type, currentLevel.value, "posts"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const filteredPosts = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((post) => !!post.media); // Only include posts with media
        setPosts(filteredPosts);
        setLoading(false); // Move here to avoid flickering if query fails
      },
      (err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup
  }, [currentLevel?.type, currentLevel?.value]);

  const renderMediaItem = (item) => {
    // const mediaItem = Array.isArray(item.media) ? item.media[0] : null;
    // if (!mediaItem || !mediaItem.url || !mediaItem.type) return null;

    // const isVideo = mediaItem.type === "video";

    return (
      <TouchableOpacity
        key={item.id}
        style={{
          width: itemSize,
          height: itemSize,
          margin: 2,
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#ddd",
        }}
        onPress={() =>
          navigation.navigate("FullMedia", {
            media: item.media,
            // text: item.text,
            postId: item.id,
          })
        }
      >
        {item.media[0] === "video" ? (
          <Video
            source={{ uri: item.media[0].url }}
            resizeMode="cover"
            shouldPlay={false}
            isMuted
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        ) : (
          <FastImage
            source={{ uri: item.media[0].url }}
            style={{
              width: "100%",
              height: "100%",
            }}
            resizeMode="cover"
          />
        )}

        <Text
          style={{
            position: "absolute",
            bottom: 2,
            left: 2,
            color: "#fff",
            backgroundColor: "rgba(0,0,0,0.4)",
            paddingHorizontal: 6,
            borderRadius: 4,
            fontWeight: "bold",
            fontSize: 10,
          }}
        >
          @{item.nickname}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {loading && posts.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color={theme.colors.text} />
        </View>
      ) : posts.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            color: theme.colors.text,
            marginTop: 20,
            fontSize: 14,
          }}
        >
          No media found.
        </Text>
      ) : (
        <FlashList
          data={posts}
          keyExtractor={(item) => item.id}
          estimatedItemSize={150}
          numColumns={3}
          extraData={theme}
          contentContainerStyle={{ padding: 2 }}
          renderItem={({ item }) => renderMediaItem(item)}
          ListHeaderComponent={() => (
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                paddingVertical: 12,
                paddingHorizontal: 8,
                color: theme.colors.text,
                paddingTop: 40,
                textAlign: "center",
              }}
            >
              Media Posts
            </Text>
          )}
        />
      )}
    </View>
  );
}
