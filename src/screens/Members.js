import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  listenToMembersById,
  followUser,
  unfollowUser,
  checkIfFollowing,
} from "../services/firestore";
import { formatCount } from "../utils/format";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "../context/ThemeContext";

export default function MembersListScreen() {
  const [members, setMembers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [loading, setLoading] = useState(true); // Initial screen loading
  const [followLoading, setFollowLoading] = useState({}); // Per-button loader
  const { user } = useUser();
  const { theme } = useTheme(); // Assuming you have a theme context

  useEffect(() => {
    const unsubscribe = listenToMembersById((data) => {
      setMembers(data);
      setLoading(false); // Now safe to stop loading
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFollowingStatus = async () => {
      if (!user?.id || members.length === 0) return;

      const results = await Promise.all(
        members.map((member) =>
          checkIfFollowing(user.id, member.id).then((isFollowing) => ({
            id: member.id,
            isFollowing,
          }))
        )
      );

      const map = {};
      results.forEach((res) => {
        map[res.id] = res.isFollowing;
      });
      setFollowingMap(map);
    };

    fetchFollowingStatus();
  }, [members, user?.id]);

  const handleToggleFollow = async (memberId) => {
    if (!user?.id || user.id === memberId) return;

    setFollowLoading((prev) => ({ ...prev, [memberId]: true }));

    const isFollowing = followingMap[memberId];

    try {
      if (isFollowing) {
        await unfollowUser(user.id, memberId);
      } else {
        await followUser(user.id, memberId);
      }
      setFollowingMap((prev) => ({
        ...prev,
        [memberId]: !isFollowing,
      }));
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color={theme.colors.text} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View className="mb-4 mt-10">
        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
          Members ({formatCount(members.length)})
        </Text>
      </View>

      <FlatList
        data={[...members].sort((a, b) =>
          a.uid === user.id ? -1 : b.uid === user.id ? 1 : 0
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-4 flex-row items-center gap-3 px-2 py-2">
            <View className="flex-1 flex-row items-center gap-3">
              <Image
                source={{ uri: item.imageUrl || item.profileImage }}
                className="h-10 w-10 rounded-md"
              />
              <View className="max-w-[180px]">
                <Text
                  className="text-sm font-bold "
                  style={{ color: theme.colors.text }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name || "No Name"} {item.lastname || ""}
                </Text>
                <Text
                  className="text-sm "
                  style={{ color: theme.colors.text }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  @{item.nickname || ""}
                </Text>
              </View>
            </View>

            {item.uid === user.id ? (
              <Text
                className="text-lg font-semibold "
                style={{ color: theme.colors.text }}
              >
                You
              </Text>
            ) : (
              item.uid !== user.id && (
                <Pressable onPress={() => handleToggleFollow(item.uid)}>
                  {followLoading[item.uid] ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <Text
                      className={`text-lg font-semibold p-2 ${
                        followingMap[item.uid]
                          ? "text-red-500"
                          : "text-blue-500"
                      }`}
                    >
                      {followingMap[item.uid] ? "Unfollow" : "Follow"}
                    </Text>
                  )}
                </Pressable>
              )
            )}

            {/* Follow/Unfollow Button */}
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center">
            <Text style={{color: theme.colors.text}}>No members found</Text>
          </View>
        )}
      />
    </View>
  );
}
