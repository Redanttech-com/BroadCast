import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useLevel } from "../context/LevelContext";
import { useUser } from "@clerk/clerk-expo";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

const OptionScreen = ({ route }) => {
  const { pstId, post, userId } = route.params || {};
  const [isBookmarked, setIsBookmarked] = useState({});
  const [isReported, setIsReported] = useState({});
  const [isBookMarkVisible, setIsBookMarkVisible] = useState(false);
  const [isReportedVisible, setIsReportedVisible] = useState(false);
  const { currentLevel } = useLevel();
  const { user } = useUser();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const reasons = ["Spam", "Inappropriate Content", "Hate Speech", "Other"];
  const navigation = useNavigation();
  const { theme } = useTheme(); // Assuming you have a theme context

  const checkBookmark = async () => {
    if (!userId || !pstId) return;
    try {
      const docRef = doc(db, `bookmarks/${userId}/bookmarks`, pstId);
      const docSnap = await getDoc(docRef);
      setIsBookmarked((prev) => ({
        ...prev,
        [pstId]: docSnap.exists(),
      }));
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  const toggleBookmark = async () => {
    if (!userId || !pstId) return;
    try {
      const collectionRef = collection(db, `bookmarks/${userId}/bookmarks`);
      const docRef = doc(collectionRef, pstId);

      if (isBookmarked[pstId]) {
        await deleteDoc(docRef);
        setIsBookmarked((prev) => ({
          ...prev,
          [pstId]: false,
        }));
        Toast.show({
          type: "warn",
          text1: "Bookmark deleted successfully",
        });
        setIsBookMarkVisible(false);
      } else {
        const Images = post?.images || [];
        const video = post?.videos || null;

        const bookmarkData = { pstId, timestamp: Date.now() };
        if (Images.length) bookmarkData.Images = Images;
        if (video) bookmarkData.videos = video;

        await setDoc(docRef, bookmarkData);
        setIsBookmarked((prev) => ({
          ...prev,
          [pstId]: true,
        }));
        Toast.show({
          type: "update",
          text1: "Bookmark Successful",
        });
        setIsBookMarkVisible(false);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const checkReport = async () => {
    if (!userId || !pstId || !currentLevel) return;
    try {
      const docRef = doc(
        db,
        currentLevel?.type,
        currentLevel?.value,
        "posts",
        pstId
      );
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      setIsReported((prev) => ({
        ...prev,
        [pstId]: data?.report === true,
      }));
    } catch (error) {
      console.error("Error checking report status:", error);
    }
  };

  const toggleReport = async () => {
    if (!reportReason) {
      Toast.show({
        type: "warn",
        text1: "No reason selected!",
      });
      return;
    }

    if (!userId || !pstId || !currentLevel) return;

    try {
      const docRef = doc(
        db,
        currentLevel?.type,
        currentLevel?.value,
        "posts",
        pstId
      );

      if (isReported[pstId]) {
        await updateDoc(docRef, { report: false });
        setIsReported((prev) => ({
          ...prev,
          [pstId]: false,
        }));
        Toast.show({
          type: "error",
          text1: "Report removed successfully",
        });
      } else {
        await updateDoc(docRef, { report: true });
        setIsReported((prev) => ({
          ...prev,
          [pstId]: true,
        }));
        Toast.show({
          type: "success",
          text1: "Report successful",
        });
      }

      setIsReportedVisible(false);
    } catch (error) {
      console.error("Error toggling report:", error);
      Toast.show({
        type: "error",
        text1: "Failed to toggle report",
      });
    }
  };

  useEffect(() => {
    checkBookmark();
    checkReport();
  }, [pstId, userId]);

  const handleDelete = async () => {
    try {
      const docRef = doc(
        db,
        currentLevel.type,
        currentLevel.value,
        "posts",
        pstId
      );
      await deleteDoc(docRef);
      Toast.show({
        type: "success",
        text1: "Post deleted successfully",
      });
      setDeleteModalVisible(false);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to delete post:", error);
      Toast.show({
        type: "warn",
        text1: "Failed to delete post",
      });
      setDeleteModalVisible(false);
    }
  };

  const OptionButton = ({
    icon,
    label,
    onPress,
    iconColor = "#333",
    textColor = "#333",
  }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
      }}
      onPress={onPress}
    >
      {icon}
      <Text style={{ marginLeft: 16, fontSize: 16, color: textColor }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          navigation.goBack();
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.3)", // semi-transparent backdrop for effect
          }}
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Cast Options
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <OptionButton
              icon={
                <Feather name="bookmark" size={22} color={theme.colors.text} />
              }
              label={isBookmarked[pstId] ? "Bookmarked" : "Bookmark"}
              textColor={theme.colors.text}
              onPress={() => setIsBookMarkVisible(true)}
            />

            {user.id === userId && (
              <>
                <OptionButton
                  icon={
                    <MaterialIcons
                      name="delete-outline"
                      size={24}
                      color="red"
                    />
                  }
                  label="Delete Cast"
                  onPress={() => setDeleteModalVisible(true)}
                  iconColor="red"
                  textColor="red"
                />
              </>
            )}
            {userId !== user.id && (
              <>
                <OptionButton
                  icon={
                    <MaterialIcons name="report" size={24} color="orange" />
                  }
                  label={isReported[pstId] ? "Reported" : "Report"}
                  onPress={() => setIsReportedVisible(true)}
                  iconColor="orange"
                  textColor="orange"
                />
              </>
            )}

            {/* Bookmark Modal */}
            <Modal
              visible={isBookMarkVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setIsBookMarkVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "80%",
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    padding: 20,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      marginBottom: 10,
                    }}
                  >
                    Bookmark Cast
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: "#666", marginBottom: 20 }}
                  >
                    Are you sure you want to bookmark this cast?
                  </Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setIsBookMarkVisible(false)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        backgroundColor: "#ccc",
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={toggleBookmark}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        backgroundColor: "red",
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontSize: 16, color: "#fff" }}>
                        {isBookmarked[pstId] ? "Remove" : "Bookmark"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Report Modal */}
            <Modal
              visible={isReportedVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setIsReportedVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "85%",
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    padding: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      marginBottom: 10,
                    }}
                  >
                    {isReported[pstId]
                      ? "Cast Reported"
                      : "Select a reason to report:"}
                  </Text>
                  <Picker
                    selectedValue={reportReason}
                    onValueChange={(itemValue) => setReportReason(itemValue)}
                    style={{ width: "100%", color: "black" }}
                  >
                    <Picker.Item label="Select Reason" value="" />
                    {reasons.map((reason) => (
                      <Picker.Item key={reason} label={reason} value={reason} />
                    ))}
                  </Picker>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 20,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setIsReportedVisible(false)}
                      style={{
                        backgroundColor: "#ccc",
                        padding: 10,
                        borderRadius: 6,
                        width: "45%",
                        alignItems: "center",
                      }}
                    >
                      <Text>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={toggleReport}
                      style={{
                        backgroundColor: "orange",
                        padding: 10,
                        borderRadius: 6,
                        width: "45%",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#fff" }}>
                        {isReported[pstId] ? "Reported" : "Report"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Delete Modal */}
            <Modal
              visible={deleteModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setDeleteModalVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "80%",
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    padding: 20,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      marginBottom: 10,
                    }}
                  >
                    Delete Cast
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: "#666", marginBottom: 20 }}
                  >
                    Are you sure you want to delete this cast? This action is
                    permanent.
                  </Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setDeleteModalVisible(false)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        backgroundColor: "#ccc",
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDelete}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        backgroundColor: "red",
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontSize: 16, color: "#fff" }}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default OptionScreen;
