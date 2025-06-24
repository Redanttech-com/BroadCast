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

export default function FollowersScreen() {
  const { theme } = useTheme();
  const {
    hasFollowed,
    followMember,
    followloading,
    userDetails,
    followersCount,
  } = useFollow();
  const { user } = useUser();
  const [followersUsers, setFollowersUsers] = useState([]);
  

  useEffect(() => {
    if (!userDetails?.uid) return;

    const fetchFollowersUsers = async () => {
      try {
        // Step 1: Query all documents where "followingId" is current user ID
        const q = query(
          collection(db, "following"),
          where("followingId", "==", userDetails.uid)
        );

        const snapshot = await getDocs(q);

        // Step 2: Get follower IDs from the query result
        const followerIds = snapshot.docs.map((doc) => doc.data().followerId);

        // Step 3: Fetch user profiles for each follower ID
        const userDocs = await Promise.all(
          followerIds.map((id) => getDoc(doc(db, "users", id)))
        );

        const usersData = userDocs
          .filter((docSnap) => docSnap.exists())
          .map((docSnap) => ({ uid: docSnap.id, ...docSnap.data() }));

        setFollowersUsers(usersData);
      } catch (error) {
        console.error("Error fetching followers users:", error);
      }
    };

    fetchFollowersUsers();
  }, [userDetails?.uid]);

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
          source={{ uri: item.imageUrl || item.profileImage }}
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

      {item.uid !== userDetails?.uid && (
        <TouchableOpacity
          onPress={() => followMember(item.uid)}
          style={{
            backgroundColor: hasFollowed[item.uid]
              ? theme.colors.card
              : theme.colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          {followloading[item.uid] ? (
            <ActivityIndicator size="small" color={theme.colors.text} />
          ) : (
            <Text
              style={{
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
        data={followersUsers}
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
