import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { listenToMarketPosts } from "../../services/firestore";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../context/ThemeContext";
import FastImage from "@d11/react-native-fast-image";
import { Video } from "expo-av";

export default function MarketScreen() {
  const navigation = useNavigation();
  const [marketItems, setMarketItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToMarketPosts("someUserId", (items) => {
      setMarketItems(items);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(marketItems);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = marketItems.filter((item) => {
        return (
          item?.productname?.toLowerCase().includes(lowerCaseQuery) ||
          item?.description?.toLowerCase().includes(lowerCaseQuery)
        );
      });
      setFilteredItems(filtered);
    }
  }, [searchQuery, marketItems]);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ProductView", {
            media: item.media,
            description: item.description,
            productname: item.productname,
            postId: item.id,
            category: item.category,
            userName: item.name,
            nickname: item.nickname,
            cost: item.cost,
            imageUrl: item.imageUrl,
            userImg: item.userImg,
            itemuid: item.uid,
            docId: item.id,
          })
        }
        style={{
          flex: 1,
          margin: 4,
          borderRadius: 10,
          backgroundColor: theme.colors.card,
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
            borderRadius: 10,
            padding: 4,
            flex: 1,
            backgroundColor: theme.colors.card,
          }}
        >
          {item?.media?.length > 0 && item.media[0]?.url ? (
            item.media[0].type === "video" ? (
              <Video
                source={{ uri: item.media[0]?.url }}
                resizeMode="cover"
                shouldPlay={false}
                isMuted
                style={{ width: "100%", height: 200 }}
              />
            ) : (
              <FastImage
                source={{ uri: item.media[0]?.url }}
                style={{ width: "100%", height: 200 }}
                resizeMode="cover"
              />
            )
          ) : (
            <View
              style={{
                width: "100%",
                height: 200,
                backgroundColor: "#ccc",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#555" }}>No Media</Text>
            </View>
          )}
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
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
              color: theme.colors.text,
              marginTop: 4,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.description}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "green",
              marginTop: 4,
              fontWeight: "bold",
            }}
          >
            Price: KES {Number(item.cost).toLocaleString("en-KE")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style="auto" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mt-16">
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
              onPress={() =>
                navigation.navigate("SellForm", {
                  mode: "create", // Optional, defaults to create
                })
              }
              className="bg-gray-400 rounded-md px-3 p-2"
            >
              <Text style={{ fontWeight: "bold", color: theme.colors.text }}>
                Sell
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View className="flex-row items-center border border-gray-200 rounded-full px-2 py-1 shadow-md">
            <Ionicons name="search" size={24} color="gray" />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor={theme.colors.text}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                paddingHorizontal: 8,
                color: theme.colors.text,
              }}
            />
          </View>
        </View>
      </View>

      {/* List or Loading */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={"small"} color={theme.colors.text} />
          <Text className="text-gray-500 animate-pulse">Loading...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No Products At the moment</Text>
        </View>
      ) : (
        <FlashList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          estimatedItemSize={200}
          numColumns={2}
          extraData={theme}
          contentContainerStyle={{ padding: 2 }}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
