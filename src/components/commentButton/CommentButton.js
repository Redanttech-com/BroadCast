// src/components/PostItem/CommentButton.js
import React, { useEffect, useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@react-navigation/native";
import { formatCount } from "../../utils/format";
import { db } from "../../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const CommentButton = ({ postId, post, userId }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [comments, setComments] = useState([])

  
    useEffect(() => {
      if (!postId) return;
  
      const unsubscribe = onSnapshot(
        collection(db, "comments", postId, "comments"),
        (snapshot) => setComments(snapshot.docs)
      );
  
      return () => unsubscribe(); // ✅ cleanup on unmount or id change
    }, [postId]);

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("CommentScreen", {
          postId,
          post,
          userId,
        });
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        padding: 4,
      }}
    >
      <Ionicons name="chatbubble-outline" size={18} color={"gray"} />
       <Text style={{ color: "gray", fontSize: 12 }}>
        {comments.length === 0 ? " " : formatCount(comments.length)}
      </Text>
    </TouchableOpacity>
  );
};

export default CommentButton;
