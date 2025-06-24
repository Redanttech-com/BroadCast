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
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../services/firebase";

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

  const handleDeleteStatus = async () => {
    Alert.alert(
      "Delete Status",
      "Are you sure you want to delete this status?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "userPosts", userId, "posts", pstId));
              Toast.show({ type: "success", text1: "Status Deleted" });
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting status:", error);
              Alert.alert("Error", "Failed to delete status.");
            }
          },
        },
      ]
    );
  };

  const handleReportStatus = async () => {
    try {
      const reportRef = doc(db, "reportedPosts", pstId);
      await setDoc(reportRef, {
        post,
        reportedAt: serverTimestamp(),
        reportedBy: userId,
      });
      Toast.show({ type: "success", text1: "Status Reported" });
    } catch (error) {
      console.error("Error reporting status:", error);
      Alert.alert("Error", "Failed to report status.");
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Status Options</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Save */}
          <TouchableOpacity onPress={handleSaveStatus} style={styles.option}>
            <Ionicons name="bookmark-outline" size={20} color="#333" />
            <Text style={styles.optionText}>Save Status</Text>
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity onPress={handleDeleteStatus} style={styles.option}>
            <Ionicons name="trash-outline" size={20} color="red" />
            <Text style={[styles.optionText, { color: "red" }]}>
              Delete Status
            </Text>
          </TouchableOpacity>

          {/* Report */}
          <TouchableOpacity onPress={handleReportStatus} style={styles.option}>
            <Ionicons name="flag-outline" size={20} color="#333" />
            <Text style={styles.optionText}>Report Status</Text>
          </TouchableOpacity>
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
  header: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
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
    fontWeight: "600",
    color: "#333",
  },
});
