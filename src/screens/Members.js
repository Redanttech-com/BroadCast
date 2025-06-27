import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "../context/ThemeContext";
import { useFollow } from "../context/FollowContext";
import { formatCount } from "../utils/format";
import { db } from "../services/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export default function MembersListScreen() {
  const { user } = useUser();
  const { theme } = useTheme();
  const { hasFollowed, followMember, followloading } = useFollow();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(users);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const sortedMembers = [...members].sort((a, b) =>
    a.uid === user?.id ? -1 : b.uid === user?.id ? 1 : 0
  );

  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: theme.colors.background }}
      >
        <ActivityIndicator size="small" color={theme.colors.text} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View className="mb-4 mt-10">
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Members ({formatCount(members.length)})
        </Text>
      </View>

      <FlatList
        data={sortedMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-4 flex-row items-center gap-3 px-4 py-2">
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
                      textAlign:"center",
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
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center">
            <Text style={{ color: theme.colors.text }}>No members found</Text>
          </View>
        )}
      />
    </View>
  );
}
