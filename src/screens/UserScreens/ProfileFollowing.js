import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useFollow } from "../../context/FollowContext";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import { FlashList } from "@shopify/flash-list";
import {
  collection,
  getDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../services/firebase";

export default function ProfileFollowing({ uid }) {
  const { theme } = useTheme();
  const { hasFollowed, followMember, followloading } = useFollow();
  const { user } = useUser();

  const [displayUsers, setDisplayUsers] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ add loading

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "following"),
      where("followerId", "==", uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const followingIds = snapshot.docs.map((doc) => doc.data().followingId);

      const userDocs = await Promise.all(
        followingIds.map((id) => getDoc(doc(db, "users", id)))
      );

      const usersData = userDocs
        .filter((docSnap) => docSnap.exists())
        .map((docSnap) => ({ uid: docSnap.id, ...docSnap.data() }));

      setDisplayUsers(usersData);
      setLoading(false); // ✅ set loading to false after fetch
    });

    return () => unsubscribe();
  }, [uid]);

  const sortedMembers = [...displayUsers].sort((a, b) =>
    a.uid === user?.id ? -1 : b.uid === user?.id ? 1 : 0
  );

  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
      }}
    >
      <View className="flex-1 flex-row items-center gap-3">
        <Image
          source={{ uri: item.imageUrl || item.userImg }}
          className="h-10 w-10 rounded-md"
        />
        <View className="max-w-[180px]">
          <Text
            className="text-sm font-bold"
            style={{ color: theme.colors.text }}
            numberOfLines={1}
          >
            {item.name || "No Name"} {item.lastname || ""}
          </Text>
          <Text
            className="text-sm"
            style={{ color: theme.colors.text }}
            numberOfLines={1}
          >
            @{item.nickname || ""}
          </Text>
        </View>
      </View>

      {item.uid === user?.id ? (
        <Text
          className="text-lg font-semibold"
          style={{ color: theme.colors.text }}
        >
          You
        </Text>
      ) : (
        <TouchableOpacity
          onPress={() => followMember(item.uid)}
          style={{
            backgroundColor: hasFollowed[item.uid]
              ? theme.colors.card
              : theme.colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            minWidth: 80,
          }}
        >
          {followloading[item.uid] ? (
            <ActivityIndicator size="small" color={theme.colors.text} />
          ) : (
            <Text
              style={{
                textAlign: "center",
                color: hasFollowed[item.uid]
                  ? theme.colors.text
                  : theme.colors.background,
              }}
            >
              {hasFollowed[item.uid] ? "Unfollow" : "Follow"}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  // ✅ Global loading state spinner
  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: theme.colors.background }}
      >
        <ActivityIndicator size="large" color={theme.colors.text} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlashList
        data={sortedMembers}
        renderItem={renderItem}
        estimatedItemSize={70}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: theme.colors.text,
            }}
          >
            You’re not following anyone.
          </Text>
        }
      />
    </View>
  );
}
