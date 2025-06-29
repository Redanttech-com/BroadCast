import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useLevel } from "../context/LevelContext";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";

import { useMedia } from "../context/MediaContext";
import FastImage from "@d11/react-native-fast-image";
import Video, { ResizeMode } from "react-native-video";

export default function InputScreen() {
  const { theme } = useTheme();

  const { currentLevel } = useLevel();

  const { media, clearMedia, pickMedia, sendPost, input, setInput, loading } =
    useMedia();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>
          {currentLevel?.type === "home"
            ? "Home"
            : `${
                currentLevel?.value && typeof currentLevel.value === "string"
                  ? currentLevel.value.charAt(0).toUpperCase() +
                    currentLevel.value.slice(1)
                  : "currentLevel"
              } ${
                currentLevel?.type && typeof currentLevel.type === "string"
                  ? currentLevel.type.charAt(0).toUpperCase() +
                    currentLevel.type.slice(1)
                  : "currentLevel"
              }`}
        </Text>

        <View className="px-4">
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderColor: theme.colors.text + 99,
                borderWidth: 1,
              },
            ]}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.colors.text + "88"}
            multiline
            value={input}
            onChangeText={setInput}
          />
        </View>
        {/* Text Input */}

        {/* Media Actions */}
        <View style={styles.actions}>
          {/* Camera button */}
          <Pressable
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 50,
              marginRight: 8,
            }}
            onPress={() => pickMedia("camera")} // Wrap in an anonymous function
          >
            <Ionicons
              name="camera-outline"
              size={24}
              color={theme.colors.text}
            />
          </Pressable>

          {/* Image gallery button */}
          <Pressable
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 50,
              marginRight: 8,
            }}
            onPress={() => pickMedia()} // Wrap in an anonymous function
          >
            <Ionicons
              name="images-outline"
              size={24}
              color={theme.colors.text}
            />
          </Pressable>

          {/* Post button */}
          <Pressable
            onPress={() => sendPost()}
            className="p-4 rounded-full shadow-md bg-blue-900 w-20"
          >
            <View className="h-5 items-center justify-center">
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center text-sm font-bold text-white">
                  Cast
                </Text>
              )}
            </View>
          </Pressable>
        </View>

        {/* Media Preview */}
        {media.length > 0 ? (
          <View style={styles.mediaPreviewContainer}>
            {media.map((item, index) => (
              <View key={index} style={styles.mediaPreview}>
                {item.type === "video" ? (
                  <Video
                    source={{ uri: item.uri }}
                    style={
                      media.length === 1 ? styles.singleMedia : styles.media
                    }
                    useNativeControls
                    shouldPlay={false}
                    resizeMode={ResizeMode.COVER}
                    muted={true}
                    repeat={true}
                    paused={false}
                    controls={true}
                  />
                ) : (
                  <FastImage
                    source={{ uri: item.uri }}
                    style={
                      media.length === 1 ? styles.singleMedia : styles.media
                    }
                    resizeMode="cover"
                  />
                )}

                <Pressable
                  style={styles.removeMedia}
                  onPress={() => clearMedia(index)}
                >
                  <FontAwesome name="times" size={16} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
    paddingHorizontal: 40,
  },

  postButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#1d4ed8",
    borderRadius: 20,
  },
  postText: {
    color: "#fff",
    fontWeight: "600",
  },
  mediaPreview: {
    marginTop: 16,
    position: "relative",
    alignItems: "center",
  },
  media: {
    width: "100%",
    height: 450,
    borderRadius: 10,
  },
  removeMedia: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#0008",
    padding: 6,
    borderRadius: 20,
  },
  mediaPreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },

  mediaPreview: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
  },

  // media: {
  //   width: "100%",
  //   height: "100%",
  //   borderRadius: 8,
  // },

  removeMedia: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  mediaPreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 8,
  },
  mediaPreview: {
    position: "relative",
  },
  media: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  singleMedia: {
    width: "100%",
    aspectRatio: 1, // or 16 / 9 if you prefer wide
    borderRadius: 8,
  },
  removeMedia: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 4,
    borderRadius: 12,
  },
});
