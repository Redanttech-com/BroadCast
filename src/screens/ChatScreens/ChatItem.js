import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { getRoomId } from "../../utils/roomId";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useUser } from "@clerk/clerk-expo";
import { formatMoment } from "../../utils/formartMoment";
import { formatCount } from "../../utils/format";

export default function ChatItem({ item }) {
  const { theme } = useTheme(); // Assuming you have a theme context
  const navigation = useNavigation();
  const { user } = useUser(); // Assuming you have a user context or hook
  const [lastmessage, setLastMessage] = useState(undefined);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    const roomId = getRoomId(user?.id, item?.uid);
    const docRef = doc(db, "messages", roomId);
    const chatsRef = collection(docRef, "chats");
    const q = query(chatsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const lastMsg = messagesData[0] ?? null;
      setLastMessage(lastMsg);

      // Count messages not sent by the current user and not marked as seen
      const unseen = messagesData.filter(
        (msg) => msg.userId !== user?.id && !msg.seen
      ).length;

      setUnreadCount(unseen);
    });

    return () => unsubscribe();
  }, []);

  const renderLastMessage = () => {
    if (typeof lastmessage === "undefined") return "loading...";

    if (lastmessage) {
      if (user?.id == lastmessage?.userId) return `You: ${lastmessage?.text}`;
      return lastmessage?.text;
    } else {
      return "Say hello!";
    }
  };

  const renderTime = () => {
    if (lastmessage) {
      let date = lastmessage?.createdAt;
      return formatMoment(new Date(date.seconds * 1000), "hh:mm A");
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        setUnreadCount(0);
        navigation.navigate("ChatRoom", { item: item });
      }}
    >
      <View style={{ flexDirection: "row", padding: 10, alignItems: "center" }}>
        <Image
          source={{
            uri: item.imageUrl || item.userImg,
          }}
          style={{ width: 40, height: 40, borderRadius: 10, marginRight: 10 }}
        />

        {/* Receiver info and last message */}
        <View style={{ width: "50%" }}>
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.text,
              fontWeight: "bold",
            }}
            numberOfLines={1}
          >
            {item.name} @{item.nickname}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.text,
            }}
            numberOfLines={1}
          >
            {renderLastMessage()}
          </Text>
        </View>

        {/* Time and unread badge */}
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          {unreadCount > 0 && (
            <View
              style={{
                backgroundColor: "red",
                borderRadius: 10,
                paddingHorizontal: 6,
                paddingVertical: 2,
                marginBottom: 2,
              }}
            >
              <Text
                style={{ color: "white", fontSize: 10, fontWeight: "bold" }}
              >
                {formatCount(unreadCount)}
              </Text>
            </View>
          )}
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.text,
            }}
          >
            {renderTime()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
