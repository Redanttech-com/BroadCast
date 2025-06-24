import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Video } from "expo-av";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "../../context/ThemeContext";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

export default function ProductView() {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useUser();

  const {
    productname,
    description,
    media = [],
    userName,
    nickname,
    cost,
    itemuid,
    imageUrl,
    postId,
  } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleThumbnailPress = (index) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderMediaItem = ({ item }) => {
    if (!item?.url || !item?.type) return null;

    if (item.type === "image") {
      return (
        <Image
          source={{ uri: item.url }}
          style={styles.fullscreenMedia}
          resizeMode="cover"
        />
      );
    }

    if (item.type === "video") {
      return (
        <Video
          source={{ uri: item.url }}
          style={styles.fullscreenMedia}
          resizeMode="cover"
          controls
          shouldPlay={false}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            {itemuid === user.id && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProductOptionsScreen", {
                  postId,
                  media,
                  productname,
                  description,
                  cost,
                  userName,
                  nickname,
                  itemuid,
                  imageUrl,
                })
              }
            >
              <Entypo
                name="dots-three-vertical"
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            )}
          </View>

          {/* Media Gallery */}
          <FlatList
            data={media}
            renderItem={renderMediaItem}
            horizontal
            pagingEnabled
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
          {media.length > 1 && (
            <View style={styles.thumbnailContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {media.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleThumbnailPress(index)}
                    style={[
                      styles.thumbnailWrapper,
                      currentIndex === index && styles.activeThumbnail,
                    ]}
                  >
                    {item.type === "image" ? (
                      <Image
                        source={{ uri: item.url }}
                        style={styles.thumbnail}
                      />
                    ) : (
                      <View style={styles.videoThumbWrapper}>
                        <Ionicons
                          name="play"
                          size={20}
                          color="#fff"
                          style={{ position: "absolute" }}
                        />
                        <Video
                          source={{ uri: item.url }}
                          style={styles.thumbnail}
                          paused={false}
                          repeat={true}
                          muted={true}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {/* Product Info */}
          <View style={{ padding: 16 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {productname}
            </Text>
            <Text style={[styles.description, { color: theme.colors.text }]}>
              {description}
            </Text>
            <Text style={[styles.username, { color: theme.colors.text }]}>
              {userName} {"  "}@{nickname}
            </Text>
            <Text style={styles.price}>
              Price: KES {Number(cost).toLocaleString("en-KE")}
            </Text>
            {user.id === itemuid ? (
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => navigation.navigate("ChatScreen")}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.chatText}>Chat</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() =>
                  navigation.navigate("ChatRoom", {
                    item: {
                      uid: itemuid,
                      name: userName,
                      nickname: nickname,
                      imageUrl: imageUrl,
                      imageUrl: imageUrl,
                    },
                  })
                }
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.chatText}>Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullscreenMedia: {
    width: screenWidth,
    height: 500,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    marginTop: 8,
    fontSize: 16,
  },
  username: {
    marginTop: 8,
    fontWeight: "600",
  },
  price: {
    marginTop: 8,
    fontSize: 16,
    color: "green",
    fontWeight: "bold",
  },
  chatButton: {
    marginTop: 12,
    backgroundColor: "#4B5563",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chatText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
});
