import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Keyboard,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import MessageList from "./MessageList";
import CustomKeyboardAvoidingView from "../../components/CustomKeyboardAvoidingView";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc, // ✅ added
} from "firebase/firestore";
import { getRoomId } from "../../utils/roomId";
import { db } from "../../services/firebase";
import { useUser } from "@clerk/clerk-expo";
import { useLevel } from "../../context/LevelContext";

export default function ChatRoom() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [messages, setMessages] = useState([]);
  const textRef = useRef("");
  const { user } = useUser();
  const { userDetails } = useLevel();
  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);

  const { item } = route.params;

  useEffect(() => {
    createRoomIfNotExists();

    const roomId = getRoomId(user?.id, item?.uid);
    const chatsRef = collection(db, "messages", roomId, "chats");
    const q = query(chatsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);

      // ✅ Mark latest message as seen
      markLastMessageAsSeen(messagesData);
    });

    const KeyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      updateScroolView
    );

    return () => {
      unsubscribe();
      KeyboardDidShowListener.remove();
    };
  }, []);

  const createRoomIfNotExists = async () => {
    let roomId = getRoomId(user?.id, item?.uid);
    await setDoc(doc(db, "messages", roomId), {
      roomId,
      createdAt: Timestamp.fromDate(new Date()),
    });
  };

  const markLastMessageAsSeen = async (messages) => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.userId !== user?.id && !lastMsg.seen) {
      try {
        const roomId = getRoomId(user?.id, item?.uid);
        const msgRef = doc(db, "messages", roomId, "chats", lastMsg.id);
        await updateDoc(msgRef, { seen: true });
        console.log("Marked message as seen:", lastMsg.id);
      } catch (error) {
        console.error("Failed to mark message as seen:", error);
      }
    }
  };

  const handleMessageSend = async () => {
    let message = textRef.current.trim();
    if (!message) return;
    try {
      let roomId = getRoomId(user?.id, item?.uid);
      const docRef = doc(db, "messages", roomId);
      const messageRef = collection(docRef, "chats");
      textRef.current = "";
      if (inputRef) inputRef?.current.clear();

      const newDoc = await addDoc(messageRef, {
        userId: user?.id,
        receiverId: item?.uid, // ✅ Use senderId for consistency
        text: message,
        profileUrl: userDetails?.imageUrl || userDetails?.userImg,
        senderName: userDetails?.name || "Anonymous",
        createdAt: Timestamp.fromDate(new Date()),
        seen: false, // ✅ Make sure new messages are initially unseen
      });

      console.log("Message sent with ID: ", newDoc.id);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    updateScroolView();
  }, [messages]);

  const updateScroolView = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomKeyboardAvoidingView>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            borderBottomWidth: 1,
            borderColor: "gray",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 10, flexDirection: "row", alignItems: "center" }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{
                uri:
                  item?.imageUrl ||
                  item?.userImg ||
                  "https://placehold.co/100x100",
              }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />
            <Text
              style={{
                color: theme.colors.text,
                marginLeft: 10,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {item?.name} @{item?.nickname}
            </Text>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            backgroundColor: theme.colors.background,
            padding: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <MessageList scrollViewRef={scrollViewRef} messages={messages} />
          </View>

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              backgroundColor: theme.colors.background,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "gray",
                padding: 5,
                borderRadius: 50,
              }}
            >
              <TextInput
                ref={inputRef}
                onChangeText={(value) => (textRef.current = value)}
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.text}
                style={{
                  color: theme.colors.text,
                  flex: 1,
                  padding: 10,
                  borderRadius: 20,
                  backgroundColor: theme.colors.background,
                }}
              />
              <TouchableOpacity
                onPress={handleMessageSend}
                style={{ padding: 10 }}
              >
                <Feather
                  name="send"
                  size={24}
                  color={theme.colors.primary}
                  style={{ marginLeft: 5, marginRight: 10 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CustomKeyboardAvoidingView>
    </SafeAreaView>
  );
}
