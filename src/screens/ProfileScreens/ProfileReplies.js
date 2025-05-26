import React from "react";
import { FlatList, View, Text, Image } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const replies = []; // Replace with actual data

export default function ProfileReplies() {
  const { theme } = useTheme();
  const renderItem = ({ item }) => (
    <View className="flex-row items-center m-2 gap-2">
      <Image
        source={{ uri: item.images }}
        className="h-14 w-14 rounded-full border border-red-500"
      />
      <Text>{item.text}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={replies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        extraData={theme}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text style={{ color: theme.colors.text }}>No replies found</Text>
          </View>
        }
      />
    </View>
  );
}
