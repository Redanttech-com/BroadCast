import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";

const screenHeight = Dimensions.get("window").height;

export default function ProductOptionsScreen() {
  const route = useRoute();
  const { productUID } = route.params;
  const { user } = useUser();
  const navigation = useNavigation();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        navigation.goBack();
      }}
    >
      <View style={styles.fullScreen}>
        <View style={styles.bottomSheet}>
          <View className="items-center flex-row justify-between">
            <Text className="text-xl font-bold">Product Options</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <Text>myID{productUID}</Text>

          {productUID !== user.id && (
            <TouchableOpacity
              onPress={() => console.log("Edit Product")}
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
          )}
          {productUID !== user.id && (
            <TouchableOpacity
              onPress={() => console.log("Delete")}
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
          )}

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
              Preserve
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  bottomSheet: {
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
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
