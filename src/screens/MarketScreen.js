import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { listenToMarketPosts } from "../services/firestore";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../context/ThemeContext";

export default function MarketScreen() {
  const navigation = useNavigation();
  const [marketItems, setMarketItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToMarketPosts("someUserId", setMarketItems);
    setLoading(false);

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(marketItems);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = marketItems.filter((item) => {
        const nameMatch = item.productname
          ?.toLowerCase()
          .includes(lowerCaseQuery);
        const descMatch = item.description
          ?.toLowerCase()
          .includes(lowerCaseQuery);
        return nameMatch || descMatch;
      });
      setFilteredItems(filtered);
    }
  }, [searchQuery, marketItems]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4  mt-16">
        {/* Title and Search Section */}
        <View className="flex-1">
          <View className="flex-row items-center justify-center mb-2">
            <Text
              style={{
                flex: 1,
                color: theme.colors.text,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              Market Place
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("SellForm")}
              className="bg-gray-400 rounded-md px-3 p-2"
            >
              <Text className="text-black font-bold text-lg">Sell</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center border border-gray-200  rounded-full px-2 py-1 shadow-md">
            <Ionicons name="search" size={24} color="gray" />

            <TextInput
              placeholder="Search products..."
              placeholderTextColor={theme.colors.text}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, color: theme.colors.text }}
            />
          </View>
        </View>

        {/* Sell Button */}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 animate-pulse">Loading...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={"small"} />
          <Text className="text-gray-500">Loading Products...</Text>
        </View>
      ) : (
        <FlashList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          estimatedItemSize={200}
          extraData={theme} // 🔥 This is crucial to reflect theme changes
          numColumns={2} // Set number of columns to 2
          contentContainerStyle={{ padding: 2 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProductView", {
                  product: item,
                  productId: item.id,
                  productUID: item.uid,
                })
              }
              style={{
                flex: 1,
                margin: 4,
                borderRadius: 10,
                backgroundColor: theme.colors.card, // required for shadows to be visible
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                  },
                  android: {
                    elevation: 4,
                  },
                }),
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.card,
                  borderRadius: 10,
                  padding: 4,
                  flex: 1,
                }}
              >
                <Image
                  source={{ uri: item.images }}
                  style={{ width: "100%", height: 200, borderRadius: 10 }}
                  resizeMode="cover"
                />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "500",
                    marginTop: 8,
                    color: theme.colors.text,
                  }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.productname}
                </Text>

                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    marginTop: 8,
                    color: theme.colors.text,
                  }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.description}
                </Text>
                <Text
                  style={{ fontSize: 18, color: "green", marginTop: 4 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Price: KES {Number(item.cost).toLocaleString("en-KE")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FlashList with 2 columns */}
    </View>
  );
}
