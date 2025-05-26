import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
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
  const {user} = useUser(); // Assuming you have a user context or hook

  useEffect(() => {
    if (!postId) return; // Ensure postId is available
    const q = query(collection(db, "comments", postId, "comments"));

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
    } catch (error) {
      console.error("Error saving media:", error);
    }
  };

 const uploadMedia = async (docRefId, collectionName = "comments") => {
    if (!media?.uri || !media?.type) {
      console.error("No media URI or type found", media); // Debugging log
      return null; // Prevent upload if no media is selected
    }

    try {
      const blob = await (await fetch(media.uri)).blob();
      //  console.log("Blob created:", blob);

      // Example storage path: "county/abc123/Images" or "market/abc123/Videos"
      const mediaRef = ref(
        storage,
        `BroadCastImages/${docRefId}/${media.type}`
      );
      // console.log("Uploading to:", mediaRef.fullPath);

      await uploadBytes(mediaRef, blob);
      const downloadUrl = await getDownloadURL(mediaRef);
      //  console.log("Download URL:", downloadUrl);

      // Firestore document path
      const docRef = doc(db, collectionName, postId, collectionName, docRefId);

      await updateDoc(docRef, {
        [media?.type.toLowerCase()]: downloadUrl, // Store media URL in the correct field
      });

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading media:", error);
      return null;
    }
  };

  const sendPost = async () => {
    setLoadingComments(true);
    if (!input.trim()) {
      Alert.alert("Error", "Post content cannot be empty.");
      return;
    }

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0} // tweak this!
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
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
            <View className="w-full flex-row justify-center items-center mb-4 mt-10 px-4">
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "bold",
                  fontSize: 20,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                comments ({comments.length})
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={32} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => <RenderComment item={item} id={item.id} />}
        />

        {/* Comment Input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderTopWidth: 1,
            borderColor: "#ccc",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: theme.colors.background,
          }}
        >
          <Pressable
            onPress={() => pickMedia("camera")}
            style={{ marginRight: 10 }}
          >
            <Feather name="camera" size={24} color={theme.colors.text} />
          </Pressable>
          <Pressable
            onPress={() => pickMedia("gallery")}
            style={{ marginRight: 10 }}
          >
            <Feather name="image" size={24} color={theme.colors.text} />
          </Pressable>
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
