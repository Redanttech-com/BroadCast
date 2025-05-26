import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

export default function StatusOptions({ route }) {
  const { pstId, post, userId } = route.params || {};
  const navigation = useNavigation();

  const handleSaveStatus = async () => {
    try {
      const ref = doc(db, "userPosts", userId, "savedStatuses", pstId);
      await setDoc(ref, { post, savedAt: Date.now() });
      Toast.show({ type: "success", text1: "Status Saved Successfully" });
    } catch (error) {
      console.error("Error saving status:", error);
      Alert.alert("Error", "Failed to save status.");
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        navigation.goBack();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button */}
          <View
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Text style={styles.title}>Status Options</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={{ fontWeight: "bold" }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleSaveStatus} style={styles.option}>
            <Ionicons name="bookmark-outline" size={20} color="#333" />
            <Text style={styles.optionText}>Save Status</Text>
          </TouchableOpacity>

          {/* Add more options here */}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#111",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: 600,
    color: "#333",
  },
});
