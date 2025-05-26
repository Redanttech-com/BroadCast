import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";

export default function ProductView() {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;
  

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 4 }}>
      {/* Header with X icon */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
          justifyContent: "space-between",
          marginTop: 20,
          padding: 6,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: "600" }}>
          {product.productname}
        </Text>
        <TouchableOpacity
          style={{ flexDirection: "row", gap: 10 }}
          onPress={() =>
            navigation.navigate("ProductOptionsScreen", {
              postId: product.id, // Use 'product.id' here instead of 'item.id'
              post: product,
            })
          }
        >
          <Feather
            name="more-vertical"
            size={24}
            color="gray"
            style={{
              padding: 4,
              borderRadius: 50,
            }}
          />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: product.images }}
        style={{ width: "100%", height: "50%", borderRadius: 10 }}
      />
      <View className="gap-2 flex-col justify-between ">
        <Text style={{ fontWeight: "bold" }}>
          {product.name}
          {"  "}@{product.nickname}
        </Text>
        <Text style={{ fontSize: 18, color: "green" }}>
          {" "}
          Price: KES {Number(product.cost).toLocaleString("en-KE")}
        </Text>
        <View className="bg-gray-600 p-2 rounded-md flex-row items-center justify-center gap-2">
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
          <Text className="text-white">Chat</Text>
        </View>
      </View>

      <ScrollView>
        <Text
          style={{
            fontSize: 14,
            textAlign: "start",
            lineHeight: 18,
            marginBottom: 10
          }}
        >
          {product.description} 
        </Text>
      </ScrollView>
    </View>
  );
}

