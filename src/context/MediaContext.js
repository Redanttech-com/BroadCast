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
  const [media, setMedia] = useState([]);
  const [marketmedia, setMarketMedia] = useState([]);
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
          quality: 1,
          allowsMultipleSelection: true,
        });
      }

      if (!result.canceled) {
        const selected = result.assets || [];
        setMedia((prev) => [
          ...prev,
          ...selected.map((asset) => ({
            uri: asset.uri,
            type: asset.type.startsWith("video") ? "video" : "image",
          })),
        ]);
      }
    } catch (error) {
      //  console.error("Media picking failed:", error);
    }
  }, []);

  const pickMarketMedia = useCallback(async (source) => {
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
          quality: 1,
          allowsMultipleSelection: true,
        });
      }

      if (!result.canceled) {
        const selected = result.assets || [];
        setMarketMedia((prev) => [
          ...prev,
          ...selected.map((asset) => ({
            uri: asset.uri,
            type: asset.type.startsWith("video") ? "video" : "image",
          })),
        ]);
      }
    } catch (error) {
      //  console.error("Media picking failed:", error);
    }
  }, []);

  const uploadMedia = async (
    docRefId,
    currentLevel,
    collectionName = "posts"
  ) => {
    if (!media || media.length === 0) return null;

    try {
      const uploadedUrls = [];

      for (const item of media) {
        const blob = await (await fetch(item.uri)).blob();
        const fileName = item.uri.split("/").pop();

        const mediaRef = ref(
          storage,
          `BroadCastImages/${docRefId}/${fileName}` // use unique file name
        );

        await uploadBytes(mediaRef, blob);
        const downloadUrl = await getDownloadURL(mediaRef);

        uploadedUrls.push({
          type: item.type.toLowerCase(),
          url: downloadUrl,
        });
      }

      // Save the array of media in a `media` field
      const docRef = doc(
        db,
        currentLevel.type,
        currentLevel.value,
        collectionName,
        docRefId
      );

      await updateDoc(docRef, {
        media: uploadedUrls,
      });

      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading media:", error);
      return null;
    }
  };

  const uploadMarketMedia = async (docRefId, collectionName = "market") => {
    if (!marketmedia || marketmedia.length === 0) return null;

    try {
      const uploadedUrls = [];

      for (const item of marketmedia) {
        const blob = await (await fetch(item.uri)).blob();
        const fileName = item.uri.split("/").pop();

        const mediaRef = ref(
          storage,
          `MarketImages/${docRefId}/${fileName}` // use unique file name
        );

        await uploadBytes(mediaRef, blob);
        const downloadUrl = await getDownloadURL(mediaRef);

        uploadedUrls.push({
          type: item.type.toLowerCase(),
          url: downloadUrl,
        });
      }

      // Save the array of media in a `media` field
      const docRef = doc(db, collectionName, docRefId);

      await updateDoc(docRef, {
        media: uploadedUrls,
      });

      return uploadedUrls;
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

      if (media.length > 0) {
        for (const m of media) {
          const uploadedUrl = await uploadMedia(
            docRefId,
            currentLevel,
            "posts",
            m
          );
        }
      }

      setInput("");
      clearMedia(); // Clear media after sending post
      setMedia([]);
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
        !marketmedia ||
        !user ||
        !userDetails
      ) {
        Toast.show({ type: "error", text1: "Please Add product..." });

        return;
      }

      // Create a new post document reference
      const postRef = await addDoc(collection(db, "market"), {
        uid: user?.id,
        email: userDetails?.email || "",
        productname: productname,
        cost: cost,
        timestamp: serverTimestamp(),
        name: userDetails?.name,
        userImg: userDetails?.userImg || null,
        lastname: userDetails?.lastname || "",
        nickname: userDetails?.nickname || "",
        category: selectData,
        description: description,
        imageUrl: user?.imageUrl || "",
      });

      // Log postRef and docRefId to verify they are set correctly
      // console.log("postRef:", postRef); // log the entire object
      const docRefId = postRef.id;
      // console.log("docRefId:", docRefId); // log the id

      if (marketmedia.length > 0) {
        for (const m of marketmedia) {
          const uploadedUrl = await uploadMarketMedia(docRefId, "market", m);
        }
      }

      Toast.show({ type: "success", text1: "success." });
      // navigation.navigate("MarketScreen");

      // Reset
      setCost("");
      setDescription("");
      setProductName("");
      setSelectData("");
      setMarketMedia([]);
      clearMarketMedia(); // Clear media after sending post
    } catch (error) {
      //  console.error("Failed to send post:", error);
      Toast.show({ type: "error", text1: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const clearMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const clearMarketMedia = (index) => {
    setMarketMedia((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <MediaContext.Provider
      value={{
        media,
        marketmedia,
        clearMedia,
        sendPost,
        input,
        setMarketMedia,
        clearMarketMedia,
        setInput,
        pickMedia,
        pickMarketMedia,
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
