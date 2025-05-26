import React, { useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { listenToStatus } from "../../services/firestore";
import { useUser } from "@clerk/clerk-expo";
import Video from "react-native-video";
import { ResizeMode } from "expo-av";

export default function StatusList() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToStatus(setStatuses, setLoading);
    return () => unsubscribe();
  }, []);

  const dataWithAdd = [{ id: "add", type: "add" }, ...statuses];
  const totalStatuses = statuses.length;

  const handlePress = (status) => {
    navigation.navigate("StatusViewScreen", { status });
  };

  const borderColorAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderColorAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(borderColorAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#3b82f6", "#bd124e"],
  });

  return (
    <View style={{ paddingVertical: 10 }}>
      {loading ? (
        <View
          style={{ alignItems: "center", justifyContent: "center", height: 80 }}
        >
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          horizontal
          data={dataWithAdd}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text>No statuses available</Text>
            </View>
          }
          renderItem={({ item }) => {
            if (item.type === "add") {
              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate("StatusInput")}
                  style={{
                    marginRight: 5,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "#e0e0e0",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#ccc",
                    }}
                  >
                    <Ionicons name="add" size={28} color="#15014f" />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      marginTop: 4,
                      textAlign: "center",
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    width={60}
                  ></Text>
                </TouchableOpacity>
              );
            }

            const hasImageOrVideo = item?.videos || item?.images;
            const showInput = !hasImageOrVideo && item?.text;

            return (
              <TouchableOpacity
                onPress={() => handlePress(item)}
                style={{ marginRight: 5, alignItems: "center" }}
              >
                <Animated.View
                  style={{
                    borderWidth: 3,
                    borderColor,
                    borderRadius: 50,
                    width: 60,
                    height: 60,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 2,
                  }}
                >
                  {item?.videos ? (
                    <Video
                      source={{ uri: item?.videos }}
                      style={{ width: 50, height: 50, borderRadius: 100 }}
                      useNativeControls
                      resizeMode="cover"
                    />
                  ) : item?.images ? (
                    <Image
                      source={{ uri: item?.images }}
                      style={{ width: 50, height: 50, borderRadius: 100 }}
                      resizeMode={ResizeMode.COVER}
                    />
                  ) : showInput ? (
                    <Text
                      style={{
                        textAlign: "center",
                        color: "gray",
                        fontSize: 5,
                        fontWeight: "bold",
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item?.text}
                    </Text>
                  ) : null}
                </Animated.View>
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  width={60}
                >
                  {item.name || item.nickname}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
