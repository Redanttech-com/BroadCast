import { View, Text, ScrollView } from "react-native";
import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { FlashList } from "@shopify/flash-list";
import MessageItem from "./MessageItem";

export default function MessageList({ messages, scrollViewRef }) {
  const { theme } = useTheme(); // Assuming you have a theme context
  return (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        backgroundColor: theme.colors.background,
      }}
    >
      {messages.map((message, index) => {
        return <MessageItem message={message} key={index} />;
      })}
    </ScrollView>
  );
}
