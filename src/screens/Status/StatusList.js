// StatusList.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { ResizeMode, Video } from "expo-av";
import { useTheme } from "../../context/ThemeContext";
import { db } from "../../services/firebase";
import {
  collection,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import SegmentedRing from "../../components/Status/SegmentedRing";
import { useSeenStatus } from "../../context/SeenStatusContext";

export default function StatusList() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { theme } = useTheme();
  const [statusGroups, setStatusGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const { seenMap } = useSeenStatus();

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    const q = query(collection(db, "status"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      const grouped = {};

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const timestamp = data?.timestamp?.toMillis?.();

        if (!timestamp) continue;

        if (now - timestamp >= oneDay) {
          await deleteDoc(doc.ref);
          continue;
        }

        if (!grouped[data.uid]) grouped[data.uid] = [];

        grouped[data.uid].push({ id: doc.id, ...data });
      }

      const groupedArray = Object.entries(grouped).map(([uid, items]) => ({
        uid,
        name: items[0]?.name || "",
        nickname: items[0]?.nickname || "",
        items: items.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds),
      }));

      setStatusGroups(groupedArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const handlePress = (statusGroup) => {
    navigation.navigate("StatusViewScreen", { statusGroup });
  };

  const dataWithAdd = [{ id: "add", type: "add" }, ...statusGroups];

  return (
    <View style={{ paddingVertical: 10 }}>
      {loading ? (
        <View
          style={{ alignItems: "center", justifyContent: "center", height: 80 }}
        >
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          horizontal
          data={dataWithAdd}
          keyExtractor={(item) => item.id || item.uid}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
          renderItem={({ item }) => {
            if (item.type === "add") {
              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate("StatusInput")}
                  style={{ marginRight: 5, alignItems: "center" }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "#e0e0e0",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#ccc",
                    }}
                  >
                    <Ionicons name="add" size={28} color="#15014f" />
                  </View>
                  <Text
                    style={{ fontSize: 12, marginTop: 4 }}
                    numberOfLines={1}
                    width={60}
                  ></Text>
                </TouchableOpacity>
              );
            }

            const first = item.items[0];
            const seenArray = item.items.map((statusItem) =>
              seenMap[item.uid]?.includes(statusItem.id)
            );

            return (
              <TouchableOpacity
                onPress={() => handlePress(item)}
                style={{ marginRight: 5, alignItems: "center" }}
              >
                <View style={{ width: 60, height: 60 }}>
                  <SegmentedRing
                    seenArray={seenArray}
                    size={60}
                    strokeWidth={3}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 5,
                      left: 5,
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      overflow: "hidden",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {first.videos ? (
                      <Video
                        source={{ uri: first.videos }}
                        style={{ width: 50, height: 50, borderRadius: 100 }}
                        resizeMode="cover"
                        isLooping
                        isMuted
                        shouldPlay
                      />
                    ) : first.images ? (
                      <Image
                        source={{ uri: first.images }}
                        style={{ width: 50, height: 50, borderRadius: 100 }}
                        resizeMode={ResizeMode.COVER}
                      />
                    ) : (
                      <Text
                        style={{
                          textAlign: "center",
                          color: "gray",
                          fontSize: 6,
                          fontWeight: "bold",
                        }}
                        numberOfLines={2}
                      >
                        {first.text}
                      </Text>
                    )}
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    textAlign: "center",
                    color: theme.colors.text,
                  }}
                  numberOfLines={1}
                  width={60}
                >
                  {item.name || item.nickname}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
