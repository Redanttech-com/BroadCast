import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { use, useEffect, useRef, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import iebc from "../assets/data/iebc.json";
import TypeWriter from "react-native-typewriter";
import { ScrollView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "@clerk/clerk-expo";
import { db, storage } from "../services/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLevel } from "../context/LevelContext";
import * as SplashScreen from "expo-splash-screen"; // Import splash screen
import { resetToDrawer } from "../navigation/TabNavigator";
import { useTheme } from "../context/ThemeContext";

export default function LocationSelectionScreen() {
  useEffect(() => {
    // Prevent splash screen from disappearing until we're ready
    SplashScreen.preventAutoHideAsync();

    // Simulate some async loading (e.g., loading user data)
    setTimeout(() => {
      // Hide the splash screen after a delay
      SplashScreen.hideAsync();
    }, 2000); // Adjust the delay (2000ms = 2 seconds) as needed
  }, []);

  const [image, setImage] = useState(null);
  const [counties, setCounties] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const { theme } = useTheme();

  const [data, setData] = useState([
    { label: "Personal Account", value: "Personal Account" },
    { label: "Business Account", value: "Business Account" },
    {
      label: "Non-profit and Community Account",
      value: "Non-profit and Community Account",
    },
    { label: "Public Figure Account", value: "Public Figure Account" },
    {
      label: "Media and Publisher Account",
      value: "Media and Publisher Account",
    },
    { label: "News and Media Outlet", value: "News and Media Outlet" },
    {
      label: "E-commerce and Retail Account",
      value: "E-commerce and Retail Account",
    },
    {
      label: "Entertainment and Event Account",
      value: "Entertainment and Event Account",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [lname, setlName] = useState("");
  const [nName, setnName] = useState("");
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState(null);

  const navigation = useNavigation();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Populate counties dropdown
  useEffect(() => {
    if (iebc?.counties) {
      const formattedCounties = iebc.counties.map((county) => ({
        label: county.name,
        value: county.name,
      }));
      setCounties(formattedCounties);
    }
  }, []);

  // Update constituencies when county changes
  useEffect(() => {
    if (selectedCounty) {
      const selectedCountyObj = iebc.counties.find(
        (county) => county.name === selectedCounty
      );

      if (selectedCountyObj?.constituencies) {
        const formattedConstituencies = selectedCountyObj.constituencies.map(
          (constituency) => ({
            label: constituency.name,
            value: constituency.name,
          })
        );
        setConstituencies(formattedConstituencies);
      } else {
        setConstituencies([]);
      }

      // Reset constituency and ward when county changes
      setSelectedConstituency(null);
      setSelectedWard(null);
    }
  }, [selectedCounty]);

  // Update wards when constituency changes
  useEffect(() => {
    if (selectedConstituency) {
      const selectedCountyObj = iebc.counties.find(
        (county) => county.name === selectedCounty
      );

      const selectedConstituencyObj = selectedCountyObj?.constituencies.find(
        (constituency) => constituency.name === selectedConstituency
      );

      if (selectedConstituencyObj?.wards) {
        const formattedWards = selectedConstituencyObj.wards.map((ward) => ({
          label: ward.name,
          value: ward.name,
        }));
        setWards(formattedWards);
      } else {
        setWards([]);
      }

      // Reset ward when constituency changes
      setSelectedWard(null);
    }
  }, [selectedConstituency]);

  const renderDropdownItem = (item) => (
    <View style={styles.item}>
      <Text style={styles.textItem}>{item.label}</Text>
      <AntDesign
        style={styles.icon}
        color={
          item.value === selectedData ||
          item.value === selectedCounty ||
          item.value === selectedConstituency ||
          item.value === selectedWard
            ? "blue"
            : "black"
        }
        name="Safety"
        size={20}
      />
    </View>
  );

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // Try from "users" collection
        const docRef = doc(db, "users", user.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserDetails({ ...data, uid: user.id });

          if (data?.uid === user.id) resetToDrawer();
        } else if (user?.primaryEmailAddress?.emailAddress) {
          // Try from "userPosts" collection
          const q = query(
            collection(db, "users"),
            where("email", "==", user.primaryEmailAddress.emailAddress)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserDetails({ ...userData, uid: user.id });

            if (userData?.uid === user.id)
               resetToDrawer();
          } else {
            setUserDetails(null);
            //  resetToDrawer(); // fallback nav
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user?.id, user?.primaryEmailAddress?.emailAddress]);

  const submit = async () => {
    if (loading) return;
    setLoading(true);

    if (!lname.trim()) {
      Toast.show({ type: "error", text1: "Last name is required." });
      setLoading(false);
      return;
    }

    if (!user?.id) {
      Toast.show({ type: "error", text1: "User not signed in." });
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.id);

    try {
      const userSnap = await getDoc(userDocRef);

      // // If user profile already exists, redirect immediately
      // if (userSnap.exists()) {
      //   Toast.show({
      //     type: "info",
      //     text1: "Profile already exists. Redirecting...",
      //   });
      //   resetToDrawer();
      //   return;
      // }

      const userInfo = {
        uid: user?.id,
        name: name.trim(),
        lastname: lname.trim(),
        nickname: nName.trim(),
        imageUrl: user.imageUrl || "",
        category: selectedData || "",
        county: selectedCounty || "",
        constituency: selectedConstituency || "",
        ward: selectedWard || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        timestamp: serverTimestamp(),
      };

      await setDoc(userDocRef, userInfo);

      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `users/${user.id}/profile.jpg`);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);

        await updateDoc(userDocRef, {
          profileImage: downloadURL,
        });

        userInfo.profileImage = downloadURL;
      }

      Toast.show({
        type: "success",
        text1: "Profile saved successfully!",
      });

      resetToDrawer();
    } catch (err) {
      console.error("Error saving profile:", err);
      Toast.show({ type: "error", text1: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background, padding: 4 }}
    >
      <View className="h-32">
        <TypeWriter
          typing={1}
          className="m-5 text-2xl font-bold  text-center"
          numberOfLines={2}
          style={{ color: theme.colors.text }}
        >
          Welcome to BroadCast, In pursuit of a perfect nation.
        </TypeWriter>
      </View>

      <ScrollView className="flex-1 pb-5">
        <View className="flex-row items-center rounded-full border border-gray-300 px-4 py-2 mb-3">
          <MaterialIcons
            name="person"
            size={24}
            color="gray"
            className="mr-3"
          />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={(userDetails && userDetails?.name) || "Enter name"}
            placeholderTextColor={theme.colors.text} // Light gray for light mode, white for dark mode
            className="flex-1 text-base"
            style={{ color: theme.colors.text }}
          />
        </View>

        {/* Last Name Input */}
        <View className="flex-row items-center  rounded-full border border-gray-300 px-4 py-2 mb-3">
          <MaterialIcons
            name="person-outline"
            size={24}
            color="gray"
            className="mr-3"
          />
          <TextInput
            value={lname}
            onChangeText={setlName}
            placeholder={
              (userDetails && userDetails?.lastname) || "Enter lastname"
            }
            placeholderTextColor={theme.colors.text} // Light gray for light mode, white for dark mode
            className="flex-1 text-base"
            style={{ color: theme.colors.text }}
          />
        </View>

        {/* Nick Name Input */}
        <View className="flex-row items-center  rounded-full border border-gray-300 px-4 py-2 mb-3">
          <MaterialIcons
            name="person-pin"
            size={24}
            color="gray"
            className="mr-3"
          />
          <TextInput
            value={nName}
            onChangeText={setnName}
            placeholder={
              (userDetails && userDetails?.nickname) || "Enter nickname"
            }
            placeholderTextColor={theme.colors.text} // Light gray for light mode, white for dark mode
            className="flex-1 text-base"
            style={{ color: theme.colors.text }}
          />
        </View>
        <View className="items-center">
          <Pressable
            onPress={handlePickImage}
            className="bg-blue-950  rounded-full p-4 flex-row gap-2"
          >
            <Text className="text-white">Choose profile</Text>
            <Text className="text-white text-sm">(Optional)</Text>
          </Pressable>
          {image && <Image source={{ uri: image }} style={styles.image} />}
        </View>
        <View>
          <Dropdown
            style={{
              margin: 8,
              height: 50,
              backgroundColor: "white",
              borderRadius: 8,
              paddingHorizontal: 12,
              borderColor: "#ddd",
              borderWidth: 1,
            }}
            data={data}
            labelField="label"
            valueField="value"
            placeholder={
              (userDetails && userDetails?.category) || "Select Category"
            }
            value={selectedData}
            onChange={(item) => setSelectedData(item.value)}
            renderItem={renderDropdownItem}
          />
        </View>
        <View>
          <Dropdown
            style={{
              margin: 8,
              height: 50,
              backgroundColor: "white",
              borderRadius: 8,
              paddingHorizontal: 12,
              borderColor: "#ddd",
              borderWidth: 1,
            }}
            data={counties}
            labelField="label"
            valueField="value"
            placeholder={
              (userDetails && userDetails?.county) || "Select County"
            }
            value={selectedCounty}
            onChange={(item) => setSelectedCounty(item.value)}
            renderItem={renderDropdownItem}
          />
        </View>
        <View>
          <Dropdown
            style={{
              margin: 8,
              height: 50,
              backgroundColor: "white",
              borderRadius: 8,
              paddingHorizontal: 12,
              borderColor: "#ddd",
              borderWidth: 1,
            }}
            data={constituencies}
            labelField="label"
            valueField="value"
            placeholder={
              (userDetails && userDetails?.constituency) ||
              "Select Conconstituency"
            }
            value={selectedConstituency}
            onChange={(item) => setSelectedConstituency(item.value)}
            renderItem={renderDropdownItem}
          />
        </View>
        <View>
          <Dropdown
            style={{
              margin: 8,
              height: 50,
              backgroundColor: "white",
              borderRadius: 8,
              paddingHorizontal: 12,
              borderColor: "#ddd",
              borderWidth: 1,
            }}
            data={wards}
            labelField="label"
            valueField="value"
            placeholder={(userDetails && userDetails?.ward) || "Select ward"}
            value={selectedWard}
            onChange={(item) => setSelectedWard(item.value)}
            renderItem={renderDropdownItem}
          />
        </View>

        <Pressable
          onPress={submit}
          disabled={
            !userDetails // If no userDetails, require all fields
              ? !name ||
                !nName ||
                !lname ||
                !selectedData ||
                !selectedCounty ||
                !selectedConstituency ||
                !selectedWard
              : !(
                  name !== userDetails?.name ||
                  nName !== userDetails?.nickname ||
                  lname !== userDetails?.lastname ||
                  selectedData !== userDetails?.category ||
                  selectedCounty !== userDetails?.county ||
                  selectedConstituency !== userDetails?.constituency ||
                  selectedWard !== userDetails?.ward
                )
          }
          className={`${
            !userDetails
              ? !name ||
                !nName ||
                !lname ||
                !selectedData ||
                !selectedCounty ||
                !selectedConstituency ||
                !selectedWard
                ? "bg-gray-700 p-4 rounded-full items-center"
                : "justify-center items-center  p-4 bg-blue-950 rounded-full"
              : !(
                  name !== userDetails?.name ||
                  nName !== userDetails?.nickname ||
                  lname !== userDetails?.lastname ||
                  selectedData !== userDetails?.category ||
                  selectedCounty !== userDetails?.county ||
                  selectedConstituency !== userDetails?.constituency ||
                  selectedWard !== userDetails?.ward
                )
              ? "bg-gray-700 p-4 rounded-full items-center"
              : "justify-center items-center  p-4 bg-blue-950 rounded-full"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" size={"small"} />
          ) : (
            <Text className="text-white">Submit</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 50,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    objectFit: "cover",
  },
  item: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  textItem: {
    fontSize: 16,
    flex: 1,
  },
  icon: {
    marginLeft: 8,
  },
});
