import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { useTheme } from "../context/ThemeContext";
import StatusList from "../components/StatusList/StatusList";
import { useLevel } from "../context/LevelContext";
import moment from "moment";

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { listenToPosts } from "../services/firestore";
import { ActivityIndicator } from "react-native-paper";

import RenderPostItem from "./RenderPostItem";
import HeaderComponent from "./HeaderComponent";
import ListEmptyComponent from "./ListEmptyComponent";
import { SafeAreaView } from "react-native-safe-area-context";

const PostScreen = React.memo(({ level }) => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentLevel } = useLevel();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500); // Minimum loading duration: 500ms

    return () => clearTimeout(timeout);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const unsubscribe = listenToPosts(currentLevel, (fetchedPosts) => {
      setPosts(fetchedPosts);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    if (!currentLevel?.type || !currentLevel?.value) return;

    setLoading(true); // Start loading before fetching

    const unsubscribe = listenToPosts(currentLevel, (fetchedPosts) => {
      setPosts(fetchedPosts);
      setLoading(false); // Stop loading after data is fetched
    });

    return () => {
      unsubscribe();
    };
  }, [currentLevel]);

  const [visibleVideoId, setVisibleVideoId] = useState(null);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80, // Adjust as needed
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    const firstVisible = viewableItems.find((item) => item.item.videos);
    setVisibleVideoId(firstVisible?.item.id ?? null);
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
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
            extraData={theme}
            nestedScrollEnabled
            viewabilityConfigCallbackPairs={
              viewabilityConfigCallbackPairs.current
            }
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={<HeaderComponent />}
            ListEmptyComponent={<ListEmptyComponent />}
            renderItem={({ item }) => (
              <RenderPostItem
                item={item}
                id={item.id}
                navigation={navigation}
                // isVisible={item.id === visibleVideoId}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
});

export default PostScreen;
