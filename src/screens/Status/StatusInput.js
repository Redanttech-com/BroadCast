import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Pressable,
  Alert,
} from "react-native";
import React, { useCallback, useState } from "react";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../services/firebase";
import { ActivityIndicator } from "react-native-paper";
import { useUser } from "@clerk/clerk-expo";
import { useLevel } from "../../context/LevelContext";
import Toast from "react-native-toast-message";
import { ResizeMode } from "expo-av";
import { useTheme } from "../../context/ThemeContext";
import FastImage from "@d11/react-native-fast-image";

export default function StatusInput() {
  const navigation = useNavigation();
  const [statusText, setStatusText] = useState("");
  const [media, setMedia] = useState({ uri: null, type: null });
  const [loading, setLoading] = useState(false);
  const { user } = useUser(); // Replace with your user context or state
  const { currentLevel, userDetails } = useLevel();
  const { theme } = useTheme(); // Assuming you have a theme context

  const pickMedia = useCallback(async (source) => {
    let result;

    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow both images & videos
        allowsEditing: true,
        quality: 1,
        allowsMultipleSelection: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
    }

    if (!result.canceled) {
      const pickedType =
        result.assets[0].type === "video" ? "Videos" : "Images";
      setMedia({ uri: result.assets[0].uri, type: pickedType });

      // Save media to storage
      saveMedia(result.assets[0].uri);
    }
  }, []);

  const saveMedia = async (uri) => {
    try {
      const fileName = uri.split("/").pop();
      const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: destinationUri,
      });

      //console.log("Media saved at:", destinationUri);
    } catch (error) {
      console.error("Error saving media:", error);
    }
  };

  const uploadMedia = async (docRefId) => {
    if (!media.uri) return;

    const blob = await (await fetch(media.uri)).blob();
    const mediaRef = ref(storage, `status/${media.type}`);
    await uploadBytes(mediaRef, blob);

    const downloadUrl = await getDownloadURL(mediaRef);
    await updateDoc(doc(db, "status", docRefId), {
      [media.type.toLowerCase()]: downloadUrl,
    });
  };

  const sendPost = async () => {
    setLoading(true);

    if (!statusText.trim()) {
      Toast.show({ type: "error", text1: "Input cannot be Empty!!" });
      setLoading(false);
      return;
    }

    if (!user || !userDetails) {
      Alert.alert("Error", "User not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "status"), {
        uid: user.id,
        text: statusText.trim(),
        userImg: userDetails?.userImg || null,
        imageUrl: userDetails.imageUrl,
        timestamp: serverTimestamp(),
        lastname: userDetails?.lastname,
        name: userDetails?.name,
        nickname: userDetails?.nickname,
        mediaUrl: null, // initially null
      });

      if (media.uri) {
        const mediaUrl = await uploadMedia(docRef.id);
        if (mediaUrl) {
          await updateDoc(doc(db, "status", docRef.id), {
            mediaUrl: mediaUrl,
          });
        }
      }

      setStatusText("");
      setMedia({ uri: null, type: null });
    } catch (error) {
      Alert.alert("Error", "Failed to post status.");
      console.error("Post error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      {/* Header */}
      <View
        style={{
          padding: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 40,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={32} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={{ fontWeight: "bold", fontSize: 16, color: theme.colors.text }}
        >
          Add Status
        </Text>
        <Text></Text>
      </View>

      {/* Text Input */}
      <View style={{ paddingHorizontal: 16 }}>
        <TextInput
          placeholder="What's on your mind?"
          value={statusText}
          onChangeText={setStatusText}
          multiline
          style={{
            borderColor: "#ccc",
            borderWidth: 1,
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
            minHeight: 80,
            textAlignVertical: "top",
            color: theme.colors.text, // Use theme color for text
          }}
        />

        {/* Action Buttons */}
        <View className="flex-row justify-center gap-6 items-center">
          {/* Open Camera */}
          <Pressable
            onPress={() => pickMedia("camera")}
            className="p-4 rounded-full border-2 border-gray-400  "
          >
            <Ionicons name="camera-outline" size={28} color={"gray"} />
          </Pressable>

          {/* Open Gallery */}
          <Pressable
            onPress={() => pickMedia("gallery")}
            className="p-4 rounded-full border-2 border-gray-400  "
          >
            <Ionicons name="images-outline" size={28} color={"gray"} />
          </Pressable>

          {/* Post Button */}
          <Pressable
            onPress={sendPost}
            className="p-4 rounded-full shadow-md bg-blue-900 w-40"
          >
            <View className="h-5 items-center justify-center">
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center text-sm font-bold text-white">
                  Cast
                </Text>
              )}
            </View>
          </Pressable>
        </View>
      </View>

      {/* Image Preview */}

      {media?.uri && (
        <View
          style={{
            position: "relative",
            marginTop: 16,
            width: "100%",
            alignItems: "center",
          }}
        >
          {media.type === "video" ? (
            <Video
              source={{ uri: media.uri }}
              style={{ width: "100%", height: 500 }}
              useNativeControls
              isLooping
              shouldPlay
              resizeMode="cover"
            />
          ) : (
            <FastImage
              source={{ uri: media.uri }}
              style={{ width: "100%", height: 500 }}
              resizeMode="cover"
            />
          )}

          {/* Remove Media Button */}
          <Pressable
            onPress={() => setMedia(null)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "#4a4a4a",
              padding: 8,
              borderRadius: 50,
            }}
          >
            <FontAwesome name="times" size={16} color="white" />
          </Pressable>
        </View>
      )}
    </View>
  );
}
