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
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Video from "react-native-video";
import { useSeenStatus } from "../../context/SeenStatusContext";
import { useUser } from "@clerk/clerk-expo";

const { width, height } = Dimensions.get("window");

export default function StatusViewScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { statusGroup, uid } = params;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(5000);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const animationRef = useRef(new Animated.Value(0));
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(5000);

  const { markAsSeen } = useSeenStatus(); // ✅ correct hook method

  const currentStatus = statusGroup.items[index];

  useEffect(() => {
    if (!currentStatus) return;
    resetAndStart();
    markAsSeen(statusGroup.uid, currentStatus.id); // ✅ mark this status as seen
    return () => {
      clearTimeout(timerRef.current);
      animationRef.current.stopAnimation();
    };
  }, [index]);

  const resetAndStart = () => {
    const defaultDuration = currentStatus?.images ? 5000 : 5000;
    const actualDuration = currentStatus?.duration
      ? currentStatus.duration
      : defaultDuration;

    setDuration(actualDuration);
    animationRef.current.setValue(0);
    startTimeRef.current = Date.now();
    remainingTimeRef.current = actualDuration;
    startAnimation(actualDuration);
  };

  const startAnimation = (time) => {
    Animated.timing(animationRef.current, {
      toValue: 1,
      duration: time,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) goNextOrExit();
    });

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => goNextOrExit(), time);
  };

  const pauseTimer = () => {
    if (!paused) {
      setPaused(true);
      animationRef.current.stopAnimation(() => {
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = duration - elapsed;
      });
      clearTimeout(timerRef.current);
    }
  };

  const resumeTimer = () => {
    if (paused) {
      setPaused(false);
      startTimeRef.current = Date.now();
      startAnimation(remainingTimeRef.current);
    }
  };

  const goNextOrExit = () => {
    if (index < statusGroup.items.length - 1) {
      setIndex(index + 1);
    } else {
      navigation.goBack();
    }
  };

  const widthInterpolated = animationRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const isVideo = !!currentStatus?.videos;
  const isImage = !!currentStatus?.images;
  const isText = !!currentStatus?.text;

  return (
    <>
      {/* Single progress bar per status – can later be split per segment */}
      <View style={styles.progressContainer}>
        {statusGroup.items.map((_, i) => (
          <View key={i} style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width:
                    i < index
                      ? "100%"
                      : i === index
                      ? animationRef.current.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        })
                      : "0%",
                },
              ]}
            />
          </View>
        ))}
      </View>

      <Pressable
        style={StyleSheet.absoluteFill}
        onPressIn={pauseTimer}
        onPressOut={resumeTimer}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="close"
              size={28}
              color="#fff"
              className="bg-gray-400 rounded-full p-2"
            />
          </TouchableOpacity>
            <TouchableOpacity
              onPressIn={pauseTimer}
              onPress={() =>
                navigation.navigate("StatusOptions", {
                  pstId: currentStatus.id,
                  post: {
                    url: currentStatus?.videos || currentStatus?.images,
                    text: currentStatus?.text || "",
                  },
                  userId: statusGroup.uid,
                  resume: resumeTimer,
                  gonext: goNextOrExit,
                })
              }
            >
              <Feather
                name="more-vertical"
                size={24}
                color="#fff"
                className="bg-gray-400 rounded-full p-2"
              />
            </TouchableOpacity>
        </View>

        <View style={styles.mediaContainer}>
          {isVideo && (
            <Video
              source={{ uri: currentStatus.videos }}
              style={styles.media}
              resizeMode="contain"
              paused={paused}
              repeat={false}
              muted={true}
              onLoad={(data) => {
                const ms = data.duration * 1000;
                setDuration(ms);
                resetAndStart();
                setIsVideoReady(true);
              }}
              ref={videoRef}
            />
          )}
          {isImage && (
            <Image
              source={{ uri: currentStatus.images }}
              style={styles.media}
              resizeMode="contain"
            />
          )}
          {isText && (
            <ScrollView contentContainerStyle={styles.textContainer}>
              <Text style={styles.text}>{currentStatus.text}</Text>
            </ScrollView>
          )}
        </View>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "black",
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
  progressContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 30,
    left: 10,
    right: 10,
    zIndex: 10,
    gap: 4,
  },

  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },

  progressBarFill: {
    height: 3,
    backgroundColor: "blue",
    borderRadius: 2,
  },
});
