import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { db } from "../../services/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { getFollowing } from "../../services/firestore"; // assumes this reads from `userRelations`
import { useTheme } from "../../context/ThemeContext";
import { ActivityIndicator } from "react-native-paper";

export default function ProfileFollowing() {
  const { user } = useUser();
  const [following, setFollowing] = useState([]);
  const [followingProfiles, setFollowingProfiles] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const { theme } = useTheme();

  // Step 1: Get following IDs
  const fetchFollowingIds = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await getFollowing(user.id); // [{ id, timestamp }]
      setFollowing(result.map((f) => f.id));
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchFollowingIds();
  }, [fetchFollowingIds]);

  // Step 2: Fetch profile data from `users` collection
  useEffect(() => {
    if (!following.length) return;

    const batches = [];
    for (let i = 0; i < following.length; i += 10) {
      const batch = following.slice(i, i + 10);
      batches.push(batch);
    }

    const unsubscribes = [];
    setLoading(true); // Set loading to true when fetching profiles

    batches.forEach((batch) => {
      const q = query(
        collection(db, "userPosts"),
        where("__name__", "in", batch)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFollowingProfiles((prev) => {
          const ids = new Set(data.map((d) => d.id));
          return [...prev.filter((p) => !ids.has(p.id)), ...data];
        });
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
      setLoading(false); // Set loading to false once the data has been fetched
    };
  }, [following]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={"small"} color={theme.colors.Text} />
        </View>
      ) : (
        <FlatList
          data={followingProfiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 10,
              }}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ height: 40, width: 40, borderRadius: 20 }}
              />
              <Text style={{ marginLeft: 10, fontSize: 14 }}>{item.name}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Text style={{ fontSize: 14, color: theme.colors.text }}>
                You are not following anyone yet
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
