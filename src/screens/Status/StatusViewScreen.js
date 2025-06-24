import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Video from "react-native-video";

export default function StatusViewScreen({ route }) {
  const { status } = route.params;
  const navigation = useNavigation();

  const animationRef = useRef(new Animated.Value(0));
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(5000);
  const [paused, setPaused] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [duration, setDuration] = useState(5000);


  useEffect(() => {
    resetAndStart();
    return () => {
      clearTimeout(timerRef.current);
      animationRef.current.stopAnimation();
    };
  }, [status]);

  const resetAndStart = () => {
    let time = 5000; // default fallback

    if (hasImage && !hasVideo) time = 1000; // image only = 1 second

    setDuration(time);
    animationRef.current.setValue(0);
    startTimeRef.current = Date.now();
    remainingTimeRef.current = time;
    startAnimation(time);
  };

  const startAnimation = (time) => {
    Animated.timing(animationRef.current, {
      toValue: 1,
      duration: time,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) navigation.goBack();
    });

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigation.goBack(), time);
  };

  const pauseTimer = () => {
    if (!paused) {
      setPaused(true);
      animationRef.current.stopAnimation((value) => {
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = duration - elapsed;
      });
      clearTimeout(timerRef.current);
      if (videoRef.current && isVideoReady) videoRef.current.pauseAsync();
    }
  };

  const resumeTimer = () => {
    if (paused) {
      setPaused(false);
      startTimeRef.current = Date.now();
      startAnimation(remainingTimeRef.current);
      if (videoRef.current && isVideoReady) videoRef.current.playAsync();
    }
  };

  const widthInterpolated = animationRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const hasImage = status.images;
  const hasVideo = status.videos;
  const hasText = status.text;

  return (
    <>
      <Animated.View
        style={[styles.progressBar, { width: widthInterpolated }]}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        {/* Progress Bar */}

        {/* Top Controls */}

        <Pressable
          style={StyleSheet.absoluteFill}
          onPressIn={pauseTimer}
          onPressOut={resumeTimer}
        >
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("StatusOptions", {
                  pstId: status.id,
                  userId: status.uid,
                  post: status,
                })
              }
            >
              <Feather name="more-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {/* Content */}
          <View style={styles.mediaContainer}>
            {hasVideo ? (
              <Video
                source={{ uri: status.videos }}
                style={styles.media}
                resizeMode="contain"
                paused={false}
                repeat={false}
                muted={true}
                onLoad={(data) => {
                  if (data.duration) {
                    const ms = data.duration * 1000;
                    setDuration(ms);
                    resetAndStart(); // restart animation when video loads
                  }
                  setIsVideoReady(true);
                }}
                ref={videoRef}
              />
            ) : hasImage ? (
              <Image
                source={{ uri: status.images }}
                style={styles.media}
                resizeMode="contain"
              />
            ) : null}

            {hasText && (
              <ScrollView
                contentContainerStyle={styles.textContainer}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.text}>{status.text}</Text>
              </ScrollView>
            )}
          </View>
        </Pressable>
      </View>
    </>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressBar: {
    height: 3,
    backgroundColor: "#fff",
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width,
    height: height * 0.7,
  },
  textContainer: {
    position: "absolute",
    bottom: 50,
    paddingHorizontal: 20,
  },
  text: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});
