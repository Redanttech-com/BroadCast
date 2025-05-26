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
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLevel } from "../context/LevelContext";
import * as SplashScreen from "expo-splash-screen"; // Import splash screen
import { resetToDrawer } from "../navigation/TabNavigator";


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
  const [error, setError] = useState("");
  const { user } = useUser();
  const { userDetails, setUserDetails } = useLevel();

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

    const userInfo = {
      name: name.trim(),
      lastname: lname.trim(),
      nickname: nName.trim(),
      imageUrl: user.imageUrl || "",
      category: selectedData || "Unknown",
      county: selectedCounty || "Unknown",
      constituency: selectedConstituency || "Unknown",
      ward: selectedWard || "Unknown",
      email: user?.primaryEmailAddress?.emailAddress || "",
      uid: user.id,
      timestamp: serverTimestamp(),
    };

    try {
      const userDocRef = await addDoc(collection(db, "userPosts"), userInfo);

      // If an image was picked, upload it
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `userPosts/${userDocRef.id}/profile.jpg`);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);

        await updateDoc(userDocRef, {
          profileImage: downloadURL,
        });
      }

      Toast.show({
        type: "success",
        text1: "Profile saved successfully!",
      });

      // Update userDetails context to trigger RootNavigator to switch screens
      setUserDetails(userInfo);

      // Optionally navigate immediately (if you have navigation available here)
      resetToDrawer();
      
      // Optionally navigate to another screen or reset form here
    } catch (err) {
       console.error("Error saving profile:", err);
      Toast.show({ type: "error", text1: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView className="flex-1 p-5 justify-center">
      <View className="h-32">
        <TypeWriter
          typing={1}
          className="m-5 text-2xl font-bold  text-center"
          numberOfLines={2}
        >
          Welcome to BroadCast, In pursuit of a perfect nation.
        </TypeWriter>
      </View>

      <ScrollView className="flex-1 pb-5">
        <View className="flex-row items-center bg-white rounded-full border border-gray-300 px-4 py-2 mb-3">
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
            placeholderTextColor={"gray"} // Light gray for light mode, white for dark mode
            className="flex-1 text-base"
          />
        </View>
        {error && <Text className="text-red-500 mb-3">{error}</Text>}

        {/* Last Name Input */}
        <View className="flex-row items-center bg-white rounded-full border border-gray-300 px-4 py-2 mb-3">
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
            placeholderTextColor={"gray"} // Light gray for light mode, white for dark mode
            className="flex-1 text-base"
          />
        </View>
        {error && <Text className="text-red-500 mb-3">{error}</Text>}

        {/* Nick Name Input */}
        <View className="flex-row items-center bg-white rounded-full border border-gray-300 px-4 py-2 mb-3">
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
            placeholderTextColor={"gray"} // Light gray for light mode, white for dark mode
            className="flex-1 text-base"
          />
        </View>
        {error && <Text className="text-red-500 mb-3">{error}</Text>}
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
            style={styles.dropdown}
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
            style={styles.dropdown}
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
            style={styles.dropdown}
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
            style={styles.dropdown}
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
  dropdown: {
    margin: 8,
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderColor: "#ddd",
    borderWidth: 1,
  },
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
