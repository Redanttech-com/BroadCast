import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { useLevel } from "../../context/LevelContext";
import { useUser } from "@clerk/clerk-expo";
import { db } from "../../services/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useTheme } from "../../context/ThemeContext";
import FastImage from "@d11/react-native-fast-image";
import { Video } from "expo-av";

const screenWidth = Dimensions.get("window").width;
const isSmallScreen = screenWidth < 360;
const numColumns = isSmallScreen ? 2 : 3;
const itemSize = (screenWidth - 4 * (numColumns + 1)) / numColumns;

export default function ProfilePosts() {
  const { currentLevel } = useLevel();
  const { user } = useUser();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentLevel?.type || !currentLevel?.value) return;

    const q = query(
      collection(db, currentLevel.type, currentLevel.value, "posts"),
      where("uid", "==", user?.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const filteredPosts = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((post) => !!post.media);
        setPosts(filteredPosts);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentLevel?.type, currentLevel?.value]);

  const renderMediaItem = (item) => {
    const isVideo = item.media[0]?.type === "video";
    const mediaUrl = item.media[0]?.url;

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
            postId: item.id,
          })
        }
      >
        {isVideo ? (
          <Video
            source={{ uri: mediaUrl }}
            resizeMode="cover"
            shouldPlay={false}
            isMuted
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <FastImage
            source={{ uri: mediaUrl }}
            style={{ width: "100%", height: "100%" }}
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
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
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
          numColumns={numColumns}
          contentContainerStyle={{ padding: 2 }}
          renderItem={({ item }) => renderMediaItem(item)}
        />
      )}
    </View>
  );
}
