import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { db, storage } from "../../services/firebase";
import RenderComment from "./RenderComment";
import { ActivityIndicator } from "react-native-paper";
import { useLevel } from "../../context/LevelContext";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import FastImage from "@d11/react-native-fast-image";
import Video from "react-native-video";

export default function CommentScreen() {
  const { theme } = useTheme();
  const route = useRoute();
  const { postId } = route.params; // Assuming pstId is passed via navigation
  const [comments, setComments] = useState([]);
  const navigation = useNavigation();
  const [input, setInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [media, setMedia] = useState({ uri: null, type: null });
  const { currentLevel, userDetails } = useLevel();
  const flashListRef = useRef(null);
  const { user } = useUser(); // Assuming you have a user context or hook
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, "comments", postId, "comments"),
      orderBy("timestamp", "desc") // 👈 Correct usage here
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formattedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(formattedPosts);
    });

    return unsubscribe;
  }, [postId]);

  const pickMedia = useCallback(async (source) => {
    let result;

    if (source === "camera") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['image', 'video'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (!result.canceled) {
      const pickedType =
        result.assets[0].type === "video" ? "video" : "image";
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
    } catch (error) {
      console.error("Error saving media:", error);
    }
  };

  const uploadMedia = async (docRefId, collectionName = "comments") => {
    if (!media || !media.uri) return null;

    try {
      const blob = await (await fetch(media.uri)).blob();
      const fileName = media.uri.split("/").pop();

      const mediaRef = ref(storage, `commentImages/${docRefId}/${fileName}`);

      await uploadBytes(mediaRef, blob);
      const downloadUrl = await getDownloadURL(mediaRef);

      // Save as single media object
      const docRef = doc(db, collectionName, postId, collectionName, docRefId);
      await updateDoc(docRef, {
        media: {
          type: media.type.toLowerCase(),
          url: downloadUrl,
        },
      });

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading media:", error);
      return null;
    }
  };
  

  const sendPost = async () => {
    setLoadingComments(true);
    // if (!input.trim()) {
    //   Alert.alert("Error", "Post content cannot be empty.");
    //   return;
    // }

    // Ensure user and userData exist
    if (!user || !userDetails) {
      Alert.alert("Error", "User not authenticated. Please log in again.");
      return;
    }

    const docRef = await addDoc(
      collection(db, "comments", postId, "comments"),
      {
        uid: user?.id,
        comment: input.trim(),
        userImg: userDetails?.userImg || null,
        imageUrl: userDetails.imageUrl,
        timestamp: serverTimestamp(),
        lastname: userDetails?.lastname,
        name: userDetails?.name,
        nickname: userDetails?.nickname,
        mediaUrl: null,
      }
    );

    if (media.uri) {
      const mediaUrl = await uploadMedia(docRef.id);
      if (mediaUrl) {
        await updateDoc(doc(db, "comments", postId, "comments", docRef.id), {
          mediaUrl: mediaUrl,
        });
      }
    }

    setInput("");
    setMedia({ uri: null, type: null });
    setLoadingComments(false);

    // Scroll to top after new comment
    if (flashListRef.current) {
      flashListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0} // tweak this!
      >
        <FlashList
          data={comments}
          estimatedItemSize={150}
          extraData={theme}
          ref={flashListRef}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: 20 }} // add padding for the input field
          ListHeaderComponent={
            <View className="w-full flex-row justify-center items-center mt-10 mb-4  px-4">
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "bold",
                  fontSize: 18,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                Comments ({comments.length})
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={32} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => <RenderComment item={item} id={item.id} />}
        />

        {selectedImage && (
          <View
            style={{
              padding: 10,
              borderTopWidth: 1,
              borderColor: "#ccc",
              backgroundColor: theme.colors.background,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FastImage
              source={{ uri: selectedImage }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 10,
                marginBottom: 5,
              }}
              resizeMode="cover"
            />
            <TouchableOpacity onPress={() => setSelectedImage(null)}>
              <Text style={{ color: "red", fontSize: 12 }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Comment Input */}
        <View
          style={{
            borderTopWidth: 1,
            borderColor: "#ccc",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: theme.colors.background,
          }}
        >
          <View>
            {/* Icons + Media Preview */}
            <View className="flex-row items-center">
              <View className="flex-row gap-2">
                 <Pressable
                onPress={() => pickMedia("camera")}
                style={{ marginBottom: 8 }}
              >
                <Feather name="camera" size={24} color={theme.colors.text} />
              </Pressable>
              <Pressable onPress={() => pickMedia("gallery")}>
                <Feather name="image" size={24} color={theme.colors.text} />
              </Pressable>
              </View>
             


            {/* Input and Send */}
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <TextInput
                placeholder="Add a comment..."
                placeholderTextColor={theme.colors.text}
                value={input}
                onChangeText={setInput}
                style={{
                  flex: 1,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  height: 40,
                  color: theme.colors.text,
                }}
              />
              <Pressable onPress={sendPost} style={{ marginLeft: 10 }}>
                {loadingComments ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Feather name="send" size={24} color="#007AFF" />
                )}
              </Pressable>
            </View>
            </View>
              {media.uri && (
                <View style={[styles.mediaPreview, { marginTop: 8 }]}>
                  {media.type === "Videos" ? (
                    <Video
                      source={{ uri: media.uri }}
                      style={styles.singleMedia}
                      resizeMode="cover"
                      muted
                      repeat
                      paused={false}
                      controls
                    />
                  ) : (
                    <FastImage
                      source={{ uri: media.uri }}
                      style={styles.singleMedia}
                      resizeMode="cover"
                    />
                  )}
                  <Pressable
                    style={styles.removeMedia}
                    onPress={() => setMedia({ uri: null, type: null })}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </Pressable>
                </View>
              )}
          
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mediaPreview: {
    marginTop: 16,
    position: "relative",
    alignItems: "center",
  },
  media: {
    width: "100%",
    height: 450,
    borderRadius: 10,
  },
  removeMedia: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#0008",
    padding: 6,
    borderRadius: 20,
  },
  mediaPreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  singleMedia: {
    width: "60%",
    aspectRatio: 1, // or 16 / 9 if you prefer wide
    borderRadius: 8,
  },
});