import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useLevel } from "../context/LevelContext";
import { db } from "../services/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";

const POLITICAL_KEYWORDS = [
  "government",
  "president",
  "governor",
  "senator",
  "mp",
  "jubilee",
  "uda",
  "azimio",
  "election",
  "vote",
  "campaign",
  "policy",
  "parliament",
  "county",
  "minister",
  "corruption",
  "leadership",
  "democracy",
  "manifesto",
  "kasongo",
  "handshake",
  "bbi",
  "constitution",
  "justice",
  "ruto",
  "raila",
  "uhuru",
  "mca",
  "iebc",
  "supreme court",
  "cabinet",
  "devolution",
  "referendum",
  "national assembly",
  "senate",
  "development",
  "census",
  "politician",
  "appointment",
  "nomination",
  "running mate",
  "flagbearer",
  "coalition",
  "majority leader",
  "minority leader",
  "public funds",
  "kieleweke",
  "tangatanga",
  "gachagua",
  "martha karua",
  "kalonzo",
  "wiper",
  "ford kenya",
  "narc kenya",
  "kenya kwanza",
  "azimio la umoja",
  "statehouse",
  "hustler",
  "dynasty",
];

export default function Trends() {
  const { currentLevel } = useLevel();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!currentLevel?.type || !currentLevel?.value) return;

    setLoading(true);

    const postsRef = collection(
      db,
      currentLevel.type,
      currentLevel.value,
      "posts"
    );
    const q = query(postsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allPosts = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          text: doc.data().text || "",
        }));

        const filteredPosts = allPosts.filter((post) =>
          POLITICAL_KEYWORDS.some((keyword) =>
            post.text.toLowerCase().includes(keyword.toLowerCase())
          )
        );

        const allText = filteredPosts.map((post) => post.text).join(" ");
        const wordFrequency = getWordFrequency(allText);
        const politicalWords = getCommonPoliticalWords(wordFrequency);

        const keywordPosts = politicalWords.map(([word, count]) => ({
          id: `keyword-${word}`,
          text: `${word} (${count})`,
          viewCount: count,
          commentCount: 0,
          isKeyword: true,
        }));

        setPosts([...keywordPosts, ...filteredPosts]);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to posts:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentLevel]);

  const getWordFrequency = (text) => {
    const words = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    const freq = {};
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }
    return freq;
  };

  const getCommonPoliticalWords = (freqMap) => {
    return Object.entries(freqMap)
      .filter(([word]) => POLITICAL_KEYWORDS.includes(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={[
        {
          flex: 1,
          padding: 5,
          margin: 5,
          backgroundColor: theme.colors.card,
          borderRadius: 10,
        },
        item.isKeyword && {
          backgroundColor: theme.colors.primary,
          padding: 10,
          alignItems: "center",
        },
      ]}
      onPress={() => !item.isKeyword && setSelectedPost(item)}
    >
      {!item.isKeyword && item.images && (
        <Image source={{ uri: item.images }} style={styles.thumbnail} />
      )}
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          marginBottom: 5,
          color: theme.colors.text,
        }}
        numberOfLines={2}
      >
        #{item.text || "No content"}
      </Text>
      <Text style={{ fontSize: 12, color: theme.colors.text }}>
        {item.viewCount || 0} {item.isKeyword ? "mentions" : "views"} | 💬{" "}
        {item.commentCount || 0}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={{
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 10,
        backgroundColor: theme.colors.background,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 15,
          color: theme.colors.text,
        }}
      >
        {currentLevel.value} Most Popular 🔥
      </Text>
      <FlashList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={200}
        extraData={theme}
        numColumns={2}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>No trending posts available.</Text>
          )
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Modal for full post */}
      <Modal visible={!!selectedPost} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 12,
              width: "100%",
              maxHeight: "80%",
              padding: 5,
            }}
          >
            <ScrollView>
              {selectedPost?.images && (
                <Image
                  source={{ uri: selectedPost.images }}
                  style={styles.modalImage}
                />
              )}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  marginBottom: 10,
                  color: theme.colors.text,
                }}
              >
                {selectedPost?.text}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  marginBottom: 5,
                  color: theme.colors.primary,
                }}
              >
                {selectedPost?.viewCount || 0} views
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  marginBottom: 5,
                  color: theme.colors.primary,
                }}
              >
                {selectedPost?.commentCount || 0} comments
              </Text>
              <Pressable
                onPress={() => setSelectedPost(null)}
                style={styles.closeBtn}
              >
                <Text style={{ textAlign: "center", color: "white" }}>
                  Close
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({

  thumbnail: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  modalImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  closeBtn: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
});
