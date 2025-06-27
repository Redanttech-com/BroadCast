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
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useRoute } from "@react-navigation/native";

export default function ProfileFollowers({ uid }) {
  const { theme } = useTheme();
  const { user } = useUser();
  const { hasFollowed, followMember, followloading } = useFollow();
  const [followersUsers, setFollowersUsers] = useState([]);
  const [loading, setLoading] = useState(true); // add loading state

  useEffect(() => {
    if (!uid) return;

    const fetchFollowersUsers = async () => {
      try {
        setLoading(true); // start loading

        // Query all documents where "followingId" is current user ID
        const q = query(
          collection(db, "following"),
          where("followingId", "==", uid)
        );

        const snapshot = await getDocs(q);

        const followerIds = snapshot.docs.map((doc) => doc.data().followerId);

        const userDocs = await Promise.all(
          followerIds.map((id) => getDoc(doc(db, "users", id)))
        );

        const usersData = userDocs
          .filter((docSnap) => docSnap.exists())
          .map((docSnap) => ({ uid: docSnap.id, ...docSnap.data() }));

        setFollowersUsers(usersData);
      } catch (error) {
        console.error("Error fetching followers users:", error);
      } finally {
        setLoading(false); // stop loading
      }
    };

    fetchFollowersUsers();
  }, [uid]);

  const sortedMembers = [...followersUsers].sort((a, b) =>
    a.uid === user?.id ? -1 : b.uid === user?.id ? 1 : 0
  );

  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
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
            No followers found.
          </Text>
        }
      />
    </View>
  );
}
