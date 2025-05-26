import React, { createContext, useContext, useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  updateDoc,
  doc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { storage, db } from "../services/firebase"; // adjust if your path differs
import { useLevel } from "./LevelContext";
import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";

const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [media, setMedia] = useState({ uri: null, type: null });
  const { currentLevel, userDetails } = useLevel();
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [productname, setProductName] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [selectData, setSelectData] = useState("");

  const pickMedia = useCallback(async (source) => {
    let result;
    try {
      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          quality: 1,
          //  allowsMultipleSelection: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          quality: 1,
          //  allowsMultipleSelection: true,
        });
      }

      if (!result.canceled) {
        const pickedType =
          result.assets[0].type === "video" ? "Videos" : "Images";
        const pickedUri = result.assets[0].uri;

        setMedia({ uri: pickedUri, type: pickedType });

        await saveMedia(pickedUri);
      }
    } catch (error) {
      //  console.error("Media picking failed:", error);
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

      //  console.log("Media saved at:", destinationUri);
    } catch (error) {
      console.error("Error saving media:", error);
    }
  };

  const uploadMedia = async (
    docRefId,
    currentLevel,
    collectionName = "posts"
  ) => {
    if (!media?.uri || !media?.type) {
      //   console.error("No media URI or type found", media); // Debugging log
      return null; // Prevent upload if no media is selected
    }

    try {
      const blob = await (await fetch(media.uri)).blob();
      //   console.log("Blob created:", blob);

      // Example storage path: "county/abc123/Images" or "market/abc123/Videos"
      const mediaRef = ref(
        storage,
        `BroadCastImages/${docRefId}/${media.type}`
      );
      //  console.log("Uploading to:", mediaRef.fullPath);

      await uploadBytes(mediaRef, blob);
      const downloadUrl = await getDownloadURL(mediaRef);
      // console.log("Download URL:", downloadUrl);

      // Firestore document path
      const docRef = doc(
        db,
        currentLevel.type,
        currentLevel.value,
        collectionName,
        docRefId
      );

      await updateDoc(docRef, {
        [media?.type.toLowerCase()]: downloadUrl, // Store media URL in the correct field
      });

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading media:", error);
      return null;
    }
  };

  const uploadMarketMedia = async (docRefId, collectionName = "market") => {
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
      const docRef = doc(db, collectionName, docRefId);

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
    setLoading(true);

    try {
      if (!input.trim()) {
        Toast.show({
          type: "error",
          text1: "Cast cannot be empty... add caption",
        });
        return;
      }

      if (!user || !userDetails) {
        Toast.show({ type: "error", text1: "user not authenticated." });

        return;
      }

      // Create a new post document reference
      const postRef = await addDoc(
        collection(db, currentLevel.type, currentLevel.value, "posts"),
        {
          uid: user?.id,
          text: input.trim(),
          userImg: userDetails?.userImg || null,
          imageUrl: userDetails.imageUrl,
          timestamp: serverTimestamp(),
          lastname: userDetails?.lastname,
          name: userDetails?.name,
          nickname: userDetails?.nickname,
          category: userDetails?.category,
          curLevel: `${currentLevel.type}`,
        }
      );

      // Log postRef and docRefId to verify they are set correctly
    //  console.log("postRef:", postRef); // log the entire object
      const docRefId = postRef.id;
     // console.log("docRefId:", docRefId); // log the id

      if (media?.uri) {
        const uploadedUrl = await uploadMedia(docRefId, currentLevel); // Pass docRefId here
     //   console.log("Media uploaded to:", uploadedUrl);
      }

      setInput("");
      clearMedia(); // Clear media after sending post
      Toast.show({
        type: "update",
        text1: "Cast uploaded successfully",
      });
    } catch (error) {
      console.error("Failed to send post:", error);
      Toast.show({ type: "error", text1: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const sendMarketPost = async () => {
    setLoading(true);

    try {
      if (
        !productname ||
        !cost ||
        !description ||
        !selectData ||
        !media ||
        !user ||
        !userDetails
      ) {
        Toast.show({ type: "error", text1: "Please Add product..." });

        return;
      }

      // Create a new post document reference
      const postRef = await addDoc(collection(db, "market"), {
        uid: user?.id,
        email: userDetails?.email,
        productname: productname,
        cost: cost,
        timestamp: serverTimestamp(),
        name: userDetails?.name,
        userImg: userDetails?.userImg || null,
        lastname: userDetails?.lastname,
        nickname: userDetails?.nickname,
        category: selectData,
        description: description,
      });

      // Log postRef and docRefId to verify they are set correctly
      // console.log("postRef:", postRef); // log the entire object
      const docRefId = postRef.id;
      // console.log("docRefId:", docRefId); // log the id

      if (media?.uri) {
        const uploadedUrl = await uploadMarketMedia(docRefId); // Pass docRefId here
        //    console.log("Media uploaded to:", uploadedUrl);
      }
      Toast.show({ type: "success", text1: "success." });

      setCost("");
      setDescription("");
      setProductName("");
      setSelectData("");
      clearMedia(); // Clear media after sending post
    } catch (error) {
      //  console.error("Failed to send post:", error);
      Toast.show({ type: "error", text1: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const clearMedia = () => setMedia({ uri: null, type: null });

  return (
    <MediaContext.Provider
      value={{
        media,

        clearMedia,
        sendPost,
        input,
        setInput,
        pickMedia,
        loading,
        sendMarketPost,
        productname,
        cost,
        description,
        selectData,
        setDescription,
        setProductName,
        setCost,
        setSelectData,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
