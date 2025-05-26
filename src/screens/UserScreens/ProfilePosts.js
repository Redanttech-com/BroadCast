import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useLevel } from "../../context/LevelContext";
import { useUser } from "@clerk/clerk-expo";
import { listenToProfile } from "../../services/firestore";
import { Video } from "expo-av";
import { useTheme } from "../../context/ThemeContext";
import { db } from "../../services/firebase";
import {
  collection,
  onSnapshot,
  or,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useRoute } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;
const isSmallScreen = screenWidth < 360;
const numColumns = isSmallScreen ? 3 : 4;
const itemSize = (screenWidth - 4 * (numColumns + 1)) / numColumns;
const borderRadius = 8;

export default function ProfilePosts() {
  const route = useRoute();
  const  uid  = route.params;
  
  const { currentLevel } = useLevel();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!uid || !currentLevel?.type || !currentLevel?.value) return;

    console.log("Fetching posts for user ID:", uid);

    const q = query(
      collection(db, currentLevel.type, currentLevel.value, "posts"),
      // where("uid", "==", uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formattedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(formattedPosts);
    });

    console.log("Listening to posts:", posts);
    

    return unsubscribe;
  }, [uid, currentLevel]);
  

  const renderMediaItem = (item) => {
    const isVideo = !!item.videos;
    const mediaUri = isVideo ? item.videos : item.images;

    if (!mediaUri) return null;

    return (
      <TouchableOpacity
        key={item.id}
        style={{
          width: itemSize,
          height: itemSize,
          margin: 2,
          borderRadius,
          overflow: "hidden",
          backgroundColor: "#ddd",
        }}
        onPress={() => setSelectedItem(item)}
      >
        {isVideo ? (
          <Video
            source={{ uri: mediaUri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            isMuted
          />
        ) : (
          <Image
            source={{ uri: mediaUri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {posts.length === 0 ? (
        <></> // Optional: Add loading or "no media" message here
      ) : (
        <FlashList
          data={posts.filter((item) => item.images || item.videos)}
          keyExtractor={(item) => item.id}
          estimatedItemSize={150}
          extraData={theme}
          numColumns={numColumns}
          contentContainerStyle={{ padding: 2 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => renderMediaItem(item)}
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
                  borderRadius,
                  resizeMode: "contain",
                }}
              />
            ) : selectedItem.videos ? (
              <Video
                source={{ uri: selectedItem.videos }}
                shouldPlay
                isMuted
                style={{
                  width: "90%",
                  height: "70%",
                  borderRadius,
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
