import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { db } from "../../services/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { getFollowers } from "../../services/firestore"; // assumes this reads from `userRelations`
import { useTheme } from "../../context/ThemeContext";
import { ActivityIndicator } from "react-native-paper";

export default function ProfileFollowers() {
  const { user } = useUser();
  const [followers, setFollowers] = useState([]);
  const [followerProfiles, setFollowerProfiles] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state
  const { theme } = useTheme();

  // Step 1: Get follower IDs
  const fetchFollowerIds = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await getFollowers(user.id); // [{ id, timestamp }]
      setFollowers(result.map((f) => f.id));
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchFollowerIds();
  }, [fetchFollowerIds]);

  // Step 2: Fetch profile data from `users` collection
  useEffect(() => {
    if (!followers.length) return;

    const batches = [];
    for (let i = 0; i < followers.length; i += 10) {
      const batch = followers.slice(i, i + 10);
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

        setFollowerProfiles((prev) => {
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
  }, [followers]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={"small"} color={theme.colors.Text} />
        </View>
      ) : (
        <FlatList
          data={followerProfiles}
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
                No followers yet
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
