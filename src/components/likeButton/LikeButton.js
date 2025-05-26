// import React, { useState, useEffect } from "react";
// import { View, TouchableWithoutFeedback, Text, StyleSheet } from "react-native";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
// } from "react-native-reanimated";
// import { AntDesign } from "@expo/vector-icons";
// import {
//   collection,
//   doc,
//   setDoc,
//   deleteDoc,
//   onSnapshot,
// } from "firebase/firestore";
// import { db } from "../../services/firebase";

// export default function LikeButton({ postId, user }) {
//   const [liked, setLiked] = useState(false);
//   const [likeCount, setLikeCount] = useState(0);

//   const mainScale = useSharedValue(1);

//   useEffect(() => {
//     if (!user?.id || !postId) return;

//     const likesRef = collection(db, "likes", postId, "likes");

//     const unsubscribe = onSnapshot(
//       likesRef,
//       (snapshot) => {
//         setLikeCount(snapshot.size);
//         const hasLiked = snapshot.docs.some((doc) => doc.id === user.id);
//         setLiked(hasLiked);
//       },
//       (error) => {
//         console.error("onSnapshot error:", error);
//       }
//     );

//     return () => unsubscribe();
//   }, [postId, user?.id]);

//   const handlePress = async () => {
//     if (!user?.id || !postId) return;

//     const likeRef = doc(db, "likes", postId, "likes", user.id);
//     setLiked((prev) => !prev);
//     mainScale.value = withSpring(1.4, {}, () => {
//       mainScale.value = withSpring(1);
//     });

//     try {
//       if (!liked) {
//         await setDoc(likeRef, { uid: user.id, timestamp: Date.now() });
//       } else {
//         await deleteDoc(likeRef);
//       }
//     } catch (err) {
//       console.error("Error updating like:", err);
//     }
//   };

//   const heartStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: mainScale.value }],
//   }));

//   return (
//     <TouchableWithoutFeedback onPress={handlePress}>
//       <View style={styles.container}>
//         <Animated.View style={heartStyle}>
//           <AntDesign name="heart" size={24} color={liked ? "red" : "gray"} />
//         </Animated.View>
//         {likeCount > 0 && (
//           <Text style={{ color: "gray", fontSize: 14 }}>{likeCount}</Text>
//         )}
//       </View>
//     </TouchableWithoutFeedback>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
// });

import React, { useEffect, useState } from "react";
import { View, TouchableWithoutFeedback, StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { AntDesign } from "@expo/vector-icons";
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";
import { db } from "../../services/firebase";

const heartOffsets = [
  { x: -30, y: -60 },
  { x: 30, y: -60 },
  { x: -40, y: -20 },
  { x: 40, y: -20 },
  { x: 0, y: -80 },
];

export default function LikeButton({ postId, user, size = 24 }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const mainScale = useSharedValue(1);
  const burstProgress = useSharedValue(0);

  const likeRef = doc(db, "likes", postId, "likes", user?.id);

  useEffect(() => {
    if (!user?.id || !postId) return;

    const likesRef = collection(db, "likes", postId, "likes");

    const unsubscribe = onSnapshot(
      likesRef,
      (snapshot) => {
        setLikeCount(snapshot.size);
        const hasLiked = snapshot.docs.some((doc) => doc.id === user.id);
        setLiked(hasLiked);
      },
      (error) => {
        console.error("onSnapshot error:", error);
      }
    );

    return () => unsubscribe();
  }, [postId, user?.id]);

  const handlePress = async () => {
    if (!user?.id || !postId) return;

    const newLiked = !liked;
    setLiked(newLiked);

    mainScale.value = withSpring(1.4, {}, () => {
      mainScale.value = withSpring(1);
    });

    if (newLiked) {
      burstProgress.value = 0;
      burstProgress.value = withTiming(1, { duration: 600 });
    }

    try {
      if (newLiked) {
        await setDoc(likeRef, {
          uid: user.id,
          timestamp: Date.now(),
        });
      } else {
        await deleteDoc(likeRef);
      }
    } catch (err) {
      console.error("Error updating like:", err);
    }
  };

  const mainHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mainScale.value }],
  }));

  const renderBursts = () =>
    heartOffsets.map((offset, index) => {
      const style = useAnimatedStyle(() => {
        const translateX = interpolate(
          burstProgress.value,
          [0, 1],
          [0, offset.x]
        );
        const translateY = interpolate(
          burstProgress.value,
          [0, 1],
          [0, offset.y]
        );
        const opacity = interpolate(
          burstProgress.value,
          [0, 0.7, 1],
          [1, 0.8, 0]
        );
        const scale = interpolate(
          burstProgress.value,
          [0, 0.5, 1],
          [0, 1.2, 0.6]
        );
        const rotate = `${interpolate(
          burstProgress.value,
          [0, 1],
          [0, 360]
        )}deg`;

        return {
          opacity,
          transform: [{ translateX }, { translateY }, { scale }, { rotate }],
        };
      });

      return (
        <Animated.View key={index} style={[styles.burstHeart, style]}>
          <AntDesign name="heart" size={16} color="red" />
        </Animated.View>
      );
    });

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        {renderBursts()}
        <Animated.View style={mainHeartStyle}>
          <AntDesign name="heart" size={18} color={liked ? "red" : "gray"} />
        </Animated.View>
        {likeCount > 0 && <Text style={styles.likeText}>{likeCount}</Text>}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  burstHeart: {
    position: "absolute",
  },
  likeText: {
    position: "absolute",
    right: -5,
    fontSize: 14,
    color: "gray",
  },
});
