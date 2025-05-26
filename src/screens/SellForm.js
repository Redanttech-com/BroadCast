import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
  Image,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker"; // Dropdown for categories
import * as ImagePicker from "expo-image-picker"; // For picking images
import { useNavigation } from "@react-navigation/native";
import { useMedia } from "../context/MediaContext";
import Video from "react-native-video";
import { useTheme } from "../context/ThemeContext";

export default function SellForm() {
  const navigation = useNavigation();
  const categories = ["Electronics", "Clothing", "Furniture", "Books", "Other"];
  const {
    media,
    loading,
    sendMarketPost,
    productname,
    clearMedia,
    pickMedia,
    cost,
    description,
    selectData,
    setDescription,
    setProductName,
    setCost,
    setSelectData,
  } = useMedia();
  const { theme } = useTheme();

  // Categories for the dropdown

  return (
    <View
      style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background }}
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
        style={styles.input}
        placeholder="Product Name"
        value={productname}
        onChangeText={setProductName}
      />

      {/* Cost Input */}
      <Text style={{ color: theme.colors.text }}>Cost</Text>
      <TextInput
        style={styles.input}
        placeholder="Cost"
        value={cost}
        onChangeText={setCost}
        keyboardType="numeric"
      />

      {/* Description Input */}
      <Text style={{ color: theme.colors.text }}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Category Dropdown */}
      <Text style={{color: theme.colors.text}}>Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectData}
          onValueChange={setSelectData}
          style={styles.picker}
        >
          <Picker.Item label="Select Category" value="" />
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
      <View style={styles.iconButton}>
        <Pressable
          onPress={() => pickMedia("camera")} // Wrap in an anonymous function
        >
          <Ionicons name="camera-outline" size={24} color="#333" />
        </Pressable>

        {/* Image gallery button */}
        <Pressable
          onPress={() => pickMedia()} // Wrap in an anonymous function
        >
          <Ionicons name="images-outline" size={24} color="#333" />
        </Pressable>
      </View>

      {/* Display chosen image */}
      {media && media.uri ? (
        <View style={styles.imagePreviewImage}>
          {media.type === "video" ? (
            <Video
              source={{ uri: media.uri }}
              style={styles.media}
              useNativeControls
              resizeMode="contain"
            />
          ) : (
            <Image
              source={{ uri: media.uri }}
              style={styles.media}
              resizeMode="cover"
            />
          )}

          <Pressable
            style={styles.removeMedia}
            onPress={() => clearMedia()}
            className={`${!media && "hidden"}`}
          >
            <FontAwesome name="times" size={16} color="#fff" />
          </Pressable>
        </View>
      ) : null}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={sendMarketPost}>
        {loading ? (
          <Text style={styles.submitButtonText}>Adding your product...</Text>
        ) : (
          <Text style={styles.submitButtonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </View>
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
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
