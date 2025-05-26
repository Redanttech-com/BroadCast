import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
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

const screenWidth = Dimensions.get("window").width;
const itemSize = screenWidth / 3 - 4;

export default function MediaScreen() {
  const [mediaPosts, setMediaPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentLevel } = useLevel();
  const [selectedItem, setSelectedItem] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const unsubscribe = listenToMediaPosts(currentLevel, (media) => {
      setMediaPosts(media);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentLevel]);

  const renderMediaItem = (item) => {
    const isVideo = !!item.video || !!item.videos;
    const mediaUri = isVideo
      ? item.video || item.videos
      : Array.isArray(item.images)
      ? item.images[0]
      : item.images;

    if (!mediaUri) return null;

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
        onPress={() => setSelectedItem(item)}
      >
        {isVideo ? (
          <Video
            source={{ uri: mediaUri }}
            resizeMode="cover"
            posterSource={{ uri: mediaUri }}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        ) : (
          <>
            <Image
              source={{ uri: mediaUri }}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="cover"
            />
          </>
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
      {loading && mediaPosts.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={"small"} color={theme.colors.text} />
        </View>
      ) : mediaPosts.length === 0 ? (
        <Text className="text-center text-gray-500 mt-10">No media found.</Text>
      ) : (
        <FlashList
          data={mediaPosts}
          keyExtractor={(item) => item.id}
          estimatedItemSize={150}
          numColumns={3}
          extraData={theme} // 🔥 This is crucial to reflect theme changes
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

      {/* Fullscreen Preview Modal */}
      {selectedItem && (
        <Modal visible transparent animationType="fade">
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setSelectedItem(null)}
          >
            {selectedItem.images ? (
              <Image
                source={{ uri: selectedItem.images }}
                style={{
                  width: "90%",
                  height: "70%",
                  borderRadius: 10,
                  resizeMode: "contain",
                }}
              />
            ) : selectedItem.videos ? (
              <Video
                source={{ uri: selectedItem.videos }}
                shouldPlay
                style={{
                  width: "90%",
                  height: "70%",
                  borderRadius: 10,
                }}
                resizeMode="contain"
              />
            ) : null}
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
