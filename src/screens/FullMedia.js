import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Video from "react-native-video";
import { useRoute } from "@react-navigation/native";
import { useLevel } from "../context/LevelContext";
import { db } from "../services/firebase";
import { collection, doc, getCountFromServer, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useUser } from "@clerk/clerk-expo";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const FullMedia = ({ navigation }) => {
  const route = useRoute();
  const { media = [], text, postId } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { currentLevel } = useLevel();
  const { user } = useUser();

  

  const handleThumbnailPress = (index) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  // Cleanup subscription
  useEffect(() => {
    if (!postId || !user?.id || !currentLevel?.type || !currentLevel?.value)
      return;

    const fetchPost = async () => {
      try {
        const postRef = doc(
          db,
          currentLevel.type,
          currentLevel.value,
          "posts",
          postId
        );
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
  }, [postId, user?.id, currentLevel]);

  const renderMediaItem = ({ item }) => {
    if (!item?.url || !item?.type) return null;

    return (
      <View style={styles.fullscreenMedia}>
        {item.type === "image" ? (
          <Image
            source={{ uri: item.url }}
            style={styles.fullscreenMedia}
            resizeMode="contain"
          />
        ) : item.type === "video" ? (
          <Video
            source={{ uri: item.url }}
            style={styles.fullscreenMedia}
            resizeMode="contain"
            controls
            repeat
            paused={media[currentIndex] !== item}
          />
        ) : null}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>

      {/* Media Carousel */}
      <FlatList
        ref={flatListRef}
        data={media}
        horizontal
        pagingEnabled
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMediaItem}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Mini Thumbnails */}
      {media.length > 1 && (
        <View style={styles.thumbnailContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {media.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleThumbnailPress(index)}
                style={[
                  styles.thumbnailWrapper,
                  currentIndex === index && styles.activeThumbnail,
                ]}
              >
                {item.type === "image" ? (
                  <Image source={{ uri: item.url }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.videoThumbWrapper}>
                    <Ionicons
                      name="play"
                      size={20}
                      color="#fff"
                      style={{ position: "absolute" }}
                    />
                    <Video
                      source={{ uri: item.url }}
                      style={styles.thumbnail}
                      paused={false}
                      repeat={true}
                      muted={true}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Optional Text Overlay */}
      {text && (
        <View style={styles.textOverlay}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.text}>{text}</Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 5,
    borderRadius: 50,
  },
  fullscreenMedia: {
    width: screenWidth,
    height: screenHeight,
  },
  textOverlay: {
    position: "absolute",
    bottom: 200,
    left: 10,
    right: 10,
    maxHeight: "30%",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
  },
  text: {
    color: "white",
    fontSize: 14,
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  thumbnailContainer: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    flexDirection: "row",
    paddingVertical: 4,
  },
  thumbnailWrapper: {
    marginHorizontal: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: {
    borderColor: "white",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
    position: "relative",
  },
  videoThumbWrapper: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});

export default FullMedia;
