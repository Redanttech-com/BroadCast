import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { db, storage } from "../../services/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

const screenHeight = Dimensions.get("window").height;

export default function ProductOptionsScreen() {
  const route = useRoute();
  const { postId, media } = route.params;
  const { user } = useUser();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleDelete = async () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (!postId) {
              console.log("No product ID found");
              Alert.alert("Error", "Missing product ID.");
              return;
            }

            // Delete Firestore document
            await deleteDoc(doc(db, "market", postId));

            // Delete each media file using its full path
            const deletePromises = (media || []).map((item) => {
              try {
                const url = decodeURIComponent(item.url);
                const fileName = url.split("/").pop().split("?")[0]; // Extract filename
                const fileRef = ref(
                  storage,
                  `MarketImages/${postId}/${fileName}`
                );
                return deleteObject(fileRef).catch((err) => {
                  if (err.code !== "storage/object-not-found") throw err;
                });
              } catch (err) {
                console.warn("Skipping invalid media item:", item);
                return Promise.resolve();
              }
            });

            await Promise.all(deletePromises);

            console.log("Deleted document and media successfully.");
            navigation.navigate("MarketScreen");
          } catch (error) {
            console.error("An error occurred during deletion:", error);
            Alert.alert("Error", "Failed to delete item.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          navigation.goBack();
        }}
      >
        <View style={styles.fullScreen}>
          <View
            style={{
              paddingHorizontal: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 10,
              backgroundColor: theme.colors.card,
            }}
          >
            <View className="items-center flex-row justify-between">
              <Text
                style={{
                  fontWeight: "bold",
                  color: theme.colors.text,
                  fontSize: 20,
                  paddingTop: 10,
                }}
              >
                Product Options
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("SellForm", {
                  id: postId,
                })
              }
              style={styles.optionButton}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color="#007bff"
                style={styles.icon}
              />
              <Text style={[styles.optionText, { color: "#007bff" }]}>
                Edit Product
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              style={styles.optionButton}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color="#dc3545"
                style={styles.icon}
              />
              <Text style={[styles.optionText, { color: "#dc3545" }]}>
                Delete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => console.log("Preserve")}
              style={styles.optionButton}
            >
              <Ionicons
                name="archive-outline"
                size={20}
                color="#ffc107"
                style={styles.icon}
              />
              <Text style={[styles.optionText, { color: "#ffc107" }]}>
                Reserve
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  backButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },

  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  icon: {
    marginRight: 12,
  },
});
