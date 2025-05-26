import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { StatusBar } from "expo-status-bar";

export default function StatusViewScreen({ route }) {
  const { status } = route.params;
  const navigation = useNavigation();

  const [paused, setPaused] = useState(false);
  const animationRef = useRef(new Animated.Value(0));
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    startTimer();
    Animated.timing(animationRef.current, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();

    return () => clearTimeout(timerRef.current);
  }, [status]);

  const startTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      navigation.goBack();
    }, 5000);
  };

  const pauseTimer = () => {
    if (!paused) {
      setPaused(true);
      clearTimeout(timerRef.current);
      if (videoRef.current && isVideoReady) {
        videoRef.current.pauseAsync();
      }
    }
  };

  const resumeTimer = () => {
    if (paused) {
      setPaused(false);
      startTimer();
      if (videoRef.current && isVideoReady) {
        videoRef.current.playAsync();
      }
    }
  };

  const widthInterpolated = animationRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const hasMedia = status.images || status.video;
  const isTextOnly = !hasMedia && status.text;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: "black" }]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      {/* Touchable Overlay for Pause/Resume */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPressIn={pauseTimer}
        onPressOut={resumeTimer}
      />

      {/* Top Buttons */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ padding: 4, borderRadius: 50 }}
          onPress={() =>
            navigation.navigate("StatusOptions", {
              pstId: status.id,
              userId: status.uid,
              post: status,
            })
          }
        >
          <Feather
            name="more-vertical"
            size={24}
            color="#fff"
            style={{ backgroundColor: "gray", borderRadius: 50, padding: 4 }}
          />
        </TouchableOpacity>
      </View>

      {/* Media + Text Overlay */}
      {hasMedia ? (
        <View style={styles.mediaContainer}>
          {status.images ? (
            <Image source={{ uri: status.images }} style={styles.media} />
          ) : (
            <Video
              ref={videoRef}
              source={{ uri: status.video }}
              style={styles.media}
              resizeMode="contain"
              shouldPlay
              isLooping
              onPlaybackStatusUpdate={(status) =>
                setIsVideoReady(status.isLoaded)
              }
            />
          )}
          {status.text ? (
            <View style={styles.textOverlayContainer}>
              <ScrollView
                contentContainerStyle={styles.textOverlayScroll}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.textOverlay}>{status.text}</Text>
              </ScrollView>
            </View>
          ) : null}
        </View>
      ) : isTextOnly ? (
        // Text only, centered
        <View style={styles.centeredTextContainer}>
          <ScrollView contentContainerStyle={styles.centeredScrollContent}>
            <Text style={styles.text}>{status.text}</Text>
          </ScrollView>
        </View>
      ) : null}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[styles.progressBar, { width: widthInterpolated }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mediaContainer: {
    width: "100%",
    height: Dimensions.get("window").height * 0.7,
    backgroundColor: "black",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  media: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  textOverlayContainer: {
    position: "absolute",
    height: 200,
    left: 0,
    right: 0,
    bottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  textOverlayScroll: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  textOverlay: {
    color: "#fff",
    fontSize: 20,
    lineHeight: 28,
    textAlign: "center",
  },
  centeredTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "black",
  },
  centeredScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
    zIndex: 10,
    position: "absolute",
    top: 0,
    width: "100%",
  },
  backIcon: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  progressContainer: {
    position: "absolute",
    Bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    zIndex: 5,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4caf50",
  },
});
