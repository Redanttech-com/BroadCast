import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import Toast from "react-native-toast-message";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { db, storage } from "../../services/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { deleteObject, ref } from "firebase/storage";
import { useUser } from "@clerk/clerk-expo";

export default function StatusOptions({ route }) {
  const navigation = useNavigation();
  const { pstId, post, userId, resume, gonext } = route.params || {};
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { user } = useUser();

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (typeof resume === "function") resume();
      };
    }, [resume])
  );

  const handleClose = () => {
    navigation.goBack();
  };

  const handleDeleteStatus = async () => {
    if (!pstId) {
      console.log("missing documents");
      return;
    }
    try {
      const docRef = doc(db, "status", pstId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        Toast.show({ type: "warn", text1: "Post not found" });
        return;
      }

      const data = docSnap.data();
      const mediaItems = Array.isArray(data.media)
        ? data.media
        : data.media && typeof data.media === "object"
        ? [data.media]
        : [];

      for (const media of mediaItems) {
        const mediaUrl = media?.url;

        if (typeof mediaUrl === "string" && mediaUrl.includes("/o/")) {
          const pathStartIndex = mediaUrl.indexOf("/o/") + 3;
          const pathEndIndex = mediaUrl.indexOf("?");
          const fullPathEncoded = mediaUrl.substring(
            pathStartIndex,
            pathEndIndex
          );
          const fullPath = decodeURIComponent(fullPathEncoded);
          const mediaRef = ref(storage, fullPath);

          try {
            await deleteObject(mediaRef);
            console.log("✅ Deleted media:", fullPath);
          } catch (err) {
            console.error("⚠️ Error deleting media:", err);
          }
        }
      }

      await deleteDoc(docRef);
      Toast.show({ type: "success", text1: "Post deleted successfully" });

      setDeleteModalVisible(false);
      navigation.goBack();
      if (typeof gonext === "function") gonext();
    } catch (error) {
      console.error("Failed to delete post:", error.message);
      Toast.show({ type: "warn", text1: "Failed to delete post" });
      setDeleteModalVisible(false);
    }
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
      console.error("Report error:", error);
      Alert.alert("Error", "Failed to report status.");
    }
  };

  const handleSaveStatus = async () => {
    try {
      const uri = post?.url;
      const isMedia =
        uri &&
        (uri.endsWith(".jpg") || uri.endsWith(".png") || uri.endsWith(".mp4"));

      if (!isMedia) {
        Alert.alert("Unsupported", "This status has no downloadable media.");
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Cannot save media without permission."
        );
        return;
      }

      const fileName = uri.split("/").pop();
      const fileUri = FileSystem.documentDirectory + fileName;
      const downloadRes = await FileSystem.downloadAsync(uri, fileUri);

      const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);

      Alert.alert("Success", "Media saved to your gallery.");
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Error", "Failed to save status.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          navigation.goBack();
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Status Options</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleSaveStatus} style={styles.option}>
              <Ionicons name="bookmark-outline" size={20} color="#333" />
              <Text style={styles.optionText}>Save Status</Text>
            </TouchableOpacity>
            {user?.id === userId && (
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(true)}
                style={styles.option}
              >
                <Ionicons name="trash-outline" size={20} color="red" />
                <Text style={[styles.optionText, { color: "red" }]}>
                  Delete Status
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleReportStatus}
              style={styles.option}
            >
              <Ionicons name="flag-outline" size={20} color="#333" />
              <Text style={styles.optionText}>Report Status</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this status?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteStatus}>
                <Text style={styles.modalDelete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalCancel: {
    color: "#888",
    fontSize: 16,
    padding: 10,
  },
  modalDelete: {
    color: "red",
    fontSize: 16,
    padding: 10,
    fontWeight: "bold",
  },
});
