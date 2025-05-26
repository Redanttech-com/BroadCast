import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReciteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params || {};

  const [text, setText] = React.useState("");

  const handlePostRecite = () => {
    // TODO: Implement recite save logic here (e.g., Firestore)
    console.log("Recited with text:", text);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View style={styles.modal}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          {/* Post being recited */}
          <View style={styles.originalPost}>
            <Text style={styles.originalPostText} numberOfLines={4}>
              {post?.text || "Original post content goes here."}
            </Text>
          </View>

          {/* Input */}
          <TextInput
            style={styles.input}
            placeholder="Add your recite..."
            multiline
            value={text}
            onChangeText={setText}
          />

          {/* Post button */}
          <TouchableOpacity style={styles.postBtn} onPress={handlePostRecite}>
            <Text style={styles.postBtnText}>Recite</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  closeBtn: {
    alignSelf: "flex-end",
  },
  originalPost: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  originalPostText: {
    color: "#444",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    height: 100,
    textAlignVertical: "top",
    fontSize: 16,
    marginBottom: 16,
  },
  postBtn: {
    backgroundColor: "#007aff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  postBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
