import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker"; // Dropdown for categories
import * as ImagePicker from "expo-image-picker"; // For picking images
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMedia } from "../../context/MediaContext";
import { useTheme } from "../../context/ThemeContext";
import FastImage from "@d11/react-native-fast-image";
import { Video } from "expo-av";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import Toast from "react-native-toast-message";

export default function SellForm() {
  const route = useRoute();
  const { id } = route.params;
  const navigation = useNavigation();
  const [shopData, setData] = useState({});
  const categories = ["Electronics", "Clothing", "Furniture", "Books", "Other"];
  const {
    marketmedia,
    loading,
    sendMarketPost,
    productname,
    clearMarketMedia,
    pickMarketMedia,
    cost,
    description,
    selectData,
    setDescription,
    setProductName,
    setCost,
    setSelectData,
    setMarketMedia,
  } = useMedia();
  const { theme } = useTheme();

  // const handleMediaPicked = (pickedMedia) => {
  //   setMarketMedia(pickedMedia); // ← maybe from image picker

  //   const formatted = pickedMedia.map((item) => ({
  //     ...item,
  //     url: item.uri, // treat selected uri as `url` until uploaded
  //   }));

  //   setMarketMedia((prev) => ({
  //     ...prev,
  //     media: formatted,
  //   }));
  // };
  

  // Categories for the dropdown
  useEffect(() => {
    if (!id) return;
    const q = doc(db, "market", id);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() };
        setData(data);

        // Initialize form fields if not already set
        setProductName(data.productname || "");
        setCost(data.cost || "");
        setDescription(data.description || "");
        setSelectData(data.category || "");

        setMarketMedia(data.media || []);
      } else {
        console.log("Document does not exist");
      }
    });

    return () => unsubscribe();
  }, [id]);

  const updateMarketPost = async () => {
    try {
      if (!id || !productname || !cost || !description || !selectData) {
        Toast.show({ type: "error", text1: "Please fill in all fields." });
        return;
      }

      const docRef = doc(db, "market", id);

      await updateDoc(docRef, {
        productname: productname.trim(),
        cost: cost.trim(),
        description: description.trim(),
        category: selectData,
        timestamp: serverTimestamp(),
      });

      Toast.show({ type: "success", text1: "Product updated." });

      // Clear form (optional)
      setCost("");
      setDescription("");
      setProductName("");
      setSelectData("");
      setMarketMedia([]);
      clearMarketMedia();
      navigation.goBack();
    } catch (error) {
      console.error("Failed to update product:", error);
      Toast.show({ type: "error", text1: "Something went wrong." });
    }

    console.log("clicked");
  };

  return (
    <ScrollView
      style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View
        style={{
          padding: 6,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          marginTop: 20,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={32} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            textAlign: "center",
            color: theme.colors.text,
          }}
        >
          Sell Your Product
        </Text>
        <Text></Text>
      </View>
      {/* Product Name Input */}
      <Text style={{ color: theme.colors.text }}>ProductName</Text>
      <TextInput
        style={{
          color: theme.colors.text,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
          fontSize: 16,
        }}
        placeholder={shopData?.productname || "Product Name"}
        value={productname}
        onChangeText={setProductName}
      />
      {/* Cost Input */}
      <Text style={{ color: theme.colors.text }}>Cost</Text>
      <TextInput
        style={{
          color: theme.colors.text,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
          fontSize: 16,
        }}
        placeholder={shopData?.cost || "Cost"}
        value={cost}
        onChangeText={setCost}
        keyboardType="numeric"
      />
      {/* Description Input */}
      <Text style={{ color: theme.colors.text }}>Description</Text>
      <TextInput
        style={{
          color: theme.colors.text,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
          fontSize: 16,
        }}
        placeholder={shopData?.description || "Description"}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      {/* Category Dropdown */}
      <Text style={{ color: theme.colors.text }}>Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectData}
          onValueChange={setSelectData}
          style={styles.picker}
        >
          <Picker.Item
            label={shopData?.category || "Select Category"}
            value=""
          />
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
      <View style={styles.iconButton}>
        <Pressable
          onPress={() => pickMarketMedia("camera")} // Wrap in an anonymous function
        >
          <Ionicons name="camera-outline" size={24} color="#333" />
        </Pressable>

        {/* Image gallery button */}
        <Pressable
          onPress={() => pickMarketMedia()} // Wrap in an anonymous function
        >
          <Ionicons name="images-outline" size={24} color="#333" />
        </Pressable>
      </View>
      {shopData ? (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={async () => {
            try {
              await updateMarketPost();
            } catch (error) {
              console.error("Error updating or sending post:", error);
            }
          }}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Processing...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Update Product</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={async () => {
            try {
              await sendMarketPost(); // Only if needed and it's meant to update media
            } catch (error) {
              console.error("Error updating or sending post:", error);
            }
          }}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Processing...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Sell Product</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Display chosen image */}
      {(shopData?.media?.length > 0 ? shopData.media : marketmedia).map(
        (item, index) => {
          const uri = item?.uri || item?.url || fallbackImageUrl;
          const type =
            item?.type || (item?.url?.includes(".mp4") ? "video" : "image"); // fallback logic

          return (
            <View key={index} style={styles.mediaPreview}>
              {type === "video" ? (
                <Video
                  source={{ uri }}
                  style={
                    (shopData?.media?.length || marketmedia.length) === 1
                      ? styles.singleMedia
                      : styles.media
                  }
                  useNativeControls
                  shouldPlay={false}
                  resizeMode="cover"
                  muted
                  repeat
                  controls
                />
              ) : (
                <FastImage
                  source={{ uri }}
                  style={
                    (shopData?.media?.length || marketmedia.length) === 1
                      ? styles.singleMedia
                      : styles.media
                  }
                  resizeMode="cover"
                />
              )}

              <Pressable
                style={styles.removeMedia}
                onPress={() => clearMarketMedia(index)}
              >
                <FontAwesome name="times" size={16} color="#fff" />
              </Pressable>
            </View>
          );
        }
      )}

      {/* Submit Button */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  singleMedia: {
    width: "100%",
    aspectRatio: 1, // or 16 / 9 if you prefer wide
    borderRadius: 8,
  },
  iconButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 80,
    marginBottom: 10,
  },
  imagePreviewImage: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  media: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 8,
  },
  removeMedia: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },
  submitButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
