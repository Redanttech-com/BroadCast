import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Share,
  Pressable,
  RefreshControl,
  Animated,
  StyleSheet,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useLevel } from "../../context/LevelContext";
import moment from "moment";

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { listenToNews, listenToPosts } from "../../services/firestore";
import { ActivityIndicator } from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";
import HeaderRender from "./HeaderRender";
import ListEmpty from "./ListEmpty";
import NewsRender from "./NewsRender";
import HeaderComponent from "../HeaderComponent";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase";

export default function NewsScreen() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();
  const [mutedMap, setMutedMap] = useState({});
  const route = useRoute();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentLevel } = useLevel();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500); // Minimum loading duration: 500ms

    return () => clearTimeout(timeout);
  }, []);

  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   const unsubscribe = listenToNews(currentLevel, (fetchedPosts) => {
  //     setPosts(fetchedPosts);
  //     setRefreshing(false);
  //   });
  // };

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, currentLevel.type, currentLevel.value, "posts"),
          where("category", "!=", "Personal Account")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const filter = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(filter);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.log("the error", error);
      }
    };

    if (currentLevel?.type && currentLevel?.value) {
      fetchPost();
    }
  }, [currentLevel]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const currentlyVisible = new Set(viewableItems.map((item) => item.item.id));
    setMutedMap((prev) => {
      const updated = {};
      Object.keys(prev).forEach((key) => {
        updated[key] = !currentlyVisible.has(key);
      });
      return updated;
    });
  }).current;


  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="small" color={theme.colors.text} />
        </View>
      ) : (
        <FlashList
          data={posts}
          estimatedItemSize={50}
          keyExtractor={(item, index) => item.id || index.toString()}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          extraData={theme}
          onViewableItemsChanged={onViewableItemsChanged}
          removeClippedSubviews={true}
          ListHeaderComponent={<HeaderRender />}
          ListEmptyComponent={<ListEmpty />}
          renderItem={({ item }) => (
            <NewsRender item={item} id={item.id} navigation={navigation} />
          )}
        />
      )}
    </View>
  );
}
