import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, RefreshControl, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "../context/ThemeContext";
import { useLevel } from "../context/LevelContext";
import { useNavigation } from "@react-navigation/native";
import { listenToPosts } from "../services/firestore";
import { ActivityIndicator } from "react-native-paper";
import RenderPostItem from "./RenderPostItem";
import HeaderComponent from "./HeaderComponent";
import ListEmptyComponent from "./ListEmptyComponent";

const PostScreen = React.memo(() => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentLevel } = useLevel();

  // Loading minimum duration effect (optional)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  // Refresh handler - unsubscribes after first fetch to avoid piling up listeners
  const onRefresh = async () => {
    setRefreshing(true);
    const unsubscribe = listenToPosts(currentLevel, (fetchedPosts) => {
      setPosts(fetchedPosts);
      setRefreshing(false);
      unsubscribe(); // clean up immediately after refreshing data once
    });
  };

  // Main posts subscription effect
  useEffect(() => {
    if (!currentLevel?.type || !currentLevel?.value) return;

    setLoading(true);

    const unsubscribe = listenToPosts(currentLevel, (fetchedPosts) => {
      setPosts(fetchedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentLevel]);

  
  
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.text} />
        </View>
      ) : (
        <FlashList
          data={posts}
          estimatedItemSize={100} // Adjust based on your average item height
          keyExtractor={(item, index) => item.id || index.toString()}
          keyboardShouldPersistTaps="handled"
          extraData={theme}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={<HeaderComponent />}
          ListEmptyComponent={<ListEmptyComponent />}
          renderItem={({ item }) => {
            return (
              <RenderPostItem
                item={item}
                id={item.id}
                navigation={navigation}
              />
            );
          }}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PostScreen;
