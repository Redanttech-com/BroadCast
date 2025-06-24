import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "../../context/ThemeContext";
import { getRoomId } from "../../utils/roomId";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function MessageItem({ message, onDelete}) {
  const { user } = useUser();
  const { theme } = useTheme();

  const isMe = user?.id === message?.userId;

  const handleDelete = async () => {
    try {
      const roomId = getRoomId(user?.id, message?.receiverId);
      await deleteDoc(doc(db, "messages", roomId, "chats", message.id));
      onDelete?.(message.id); // 🔥 Remove from parent state
    } catch (error) {
      Alert.alert("Error", "Failed to delete message.");
      console.error("Error deleting message:", error);
    }
  };

  if (isMe) {
    return (
      <View className="flex-row justify-end mb-2 rounded-lg">
        <View className="w-3/4">
          <View className="flex-row items-center gap-2 ml-auto">
            <Menu>
              <MenuTrigger>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 20,
                    fontWeight: "bold",
                    paddingHorizontal: 6,
                  }}
                >
                  ...
                </Text>
              </MenuTrigger>
              <MenuOptions>
                <MenuOption onSelect={handleDelete}>
                  <Text style={{ color: "red", padding: 6, justifyContent:"center" }}>Delete</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>

            <Text
              style={{
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: "#e5e7eb", // neutral-200
                padding: 10,
                borderTopRightRadius: 16,
                borderBottomLeftRadius: 16,
                borderTopLeftRadius: 16,
                flexShrink: 1,
              }}
            >
              {message?.text}
            </Text>
          </View>

          <Text className="text-xs text-gray-500 ml-auto">
            {message?.seen ? "seen" : "delivered"}
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <View className="flex-row justify-start p-2 mb-2 rounded-lg">
        <View className="w-3/4">
          <View className="flex self-start p-3 rounded-tr-2xl rounded-br-2xl rounded-tl-2xl border border-neutral-200">
            <Text style={{ color: theme.colors.text }}>{message?.text}</Text>
          </View>
        </View>
      </View>
    );
  }
}
