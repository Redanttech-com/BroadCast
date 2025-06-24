import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import ChatItem from "./ChatItem";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function ChatScreen() {
  const { theme } = useTheme();
  const { user } = useUser();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const q = query(collection(db, "users"), where("uid", "!=", user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(users);
    });

    return () => unsubscribe(); // cleanup listener on unmount
  }, [user?.id]);

  const handleDeleteMessage = (id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ marginTop: 40 }}>
        <Text
          style={{
            color: theme.colors.text,
            textAlign: "center",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          Messages
        </Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ChatItem item={item} onDelete={handleDeleteMessage} />
        )}
      />
    </View>
  );
}
