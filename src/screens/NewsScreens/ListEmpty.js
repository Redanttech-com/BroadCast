import { View, Text } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ListEmpty() {
  return (
    <View className="flex-1 justify-center items-center space-y-4">
      <MaterialCommunityIcons name="newspaper-remove" size={64} color="#ccc" />
      <Text className="font-bold text-lg text-gray-500 animate-bounce">
        No news at the moment
      </Text>
    </View>
  );
}
