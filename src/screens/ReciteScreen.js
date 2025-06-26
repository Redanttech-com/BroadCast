import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useLevel } from "../context/LevelContext";
import { ActivityIndicator } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";

export default function ReciteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params || {};
  const { userDetails, currentLevel } = useLevel();

  const [citeInput, setCiteInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const cite = async () => {
    setLoading(true);
    if (post) {
      const postData = post;
      if (
        postData &&
        typeof postData?.text === "string" &&
        typeof citeInput === "string"
      ) {
        try {
          await addDoc(
            collection(db, currentLevel.type, currentLevel.value, "posts"),
            {
              uid: userDetails?.uid,
              text: postData.text,
              citeInput: citeInput,
              userImg: userDetails.userImg || "",
              imageUrl: userDetails?.imageUrl,
              lastname: userDetails.lastname,
              timestamp: serverTimestamp(),
              citetimestamp: postData.timestamp.toDate(),
              name: userDetails.name,
              fromUser: postData.name,
              nickname: userDetails.nickname,
              citeNickname: postData.nickname,
              fromlastname: postData.lastname,
              citeUserImg: postData.userImg,
              verified: userDetails.verified || "",
              views: [],
              ...(postData.imageUrl && { citeImageUrl: postData.imageUrl }),
              ...(postData.category && { category: postData.category }),
              ...(postData.media && { media: postData.media }),
            }
          );
          setCiteInput("");
          navigation.goBack();

        } catch (error) {
          console.error("Error reposting the cast:", error);
        }
      } else {
        console.error(
          "Invalid data: postData.text or citeInput is not a string."
        );
      }
    } else {
      console.log("No post data available to cast.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          navigation.goBack();
        }}
      >
        <KeyboardAvoidingView
          style={styles.backdrop}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <SafeAreaView
            style={{
              backgroundColor: theme.colors.card,
              // paddingTop: 10,
              // paddingBottom: 30,
              paddingHorizontal: 20,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 10,
            }}
          >
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <View
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{ color: theme.colors.text, fontSize: 14 }}
                numberOfLines={2}
              >
                {post?.text || "Original post content goes here."}
              </Text>
            </View>

            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                padding: 5,
                borderRadius: 10,
                height: 100,
                textAlignVertical: "top",
                fontSize: 16,
                marginBottom: 16,
                color: theme.colors.text,
                
              }}
              placeholder="Add your recite..."
              placeholderTextColor={{ color: theme.colors.text }}
              multiline
              value={citeInput}
              onChangeText={setCiteInput}
            />

            <TouchableOpacity
              onPress={cite}
              disabled={!citeInput}
              style={{
                backgroundColor: citeInput ? "#2563eb" : "#374151",
                padding: 16,
                borderRadius: 999,
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.postBtnText}>Recite</Text>
              )}
            </TouchableOpacity>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 10
  },
  postBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
