import React from "react";
import { View, Text, Image, FlatList } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const userBookMark = []; // Replace with actual data

const renderBookMark = ({ bookmark }) => (
  <View>
    <Image
      source={{ uri: bookmark.images }}
      className="h-14 w-14 rounded-full border border-red-500"
    />
    <Text>{bookmark.text}</Text>
  </View>
);

export default function ProfileBookmarks() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={userBookMark}
        renderItem={renderBookMark}
        extraData={theme}
        contentContainerStyle={{ marginBottom: 80 }}
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text style={{ color: theme.colors.text }}>Add bookmark</Text>
          </View>
        }
      />
    </View>
  );
}
