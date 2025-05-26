import React, { useEffect, useState } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Feather, FontAwesome, Fontisto, Ionicons } from "@expo/vector-icons";
import { SignedIn, useAuth, useUser } from "@clerk/clerk-expo";
import { Avatar } from "react-native-paper";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import TabNavigator from "./TabNavigator";
import ProfileScreen from "../screens/ProfileScreen";
import MarketScreen from "../screens/MarketScreen";
import Members from "../screens/Members";
import SettingsScreen from "../screens/SettingsScreen";
import MediaScreen from "../screens/MediaScreen";
import ChatScreen from "../screens/ChatScreen";
import Trends from "../screens/Trends";
import { useLevel } from "../context/LevelContext";
import { useTheme } from "../context/ThemeContext";

// Screens in the drawer
export const drawerScreens = [
  {
    name: "Members",
    component: Members,
    options: {
      title: "Members",
      drawerIcon: ({ color, size }) => (
        <Feather name="users" size={size} color={color} />
      ),
    },
  },
  {
    name: "Chat",
    component: ChatScreen,
    options: {
      title: "Chat",
      drawerIcon: ({ color, size }) => (
        <Fontisto name="hipchat" size={size} color={color} />
      ),
    },
  },
  {
    name: "MediaScreen",
    component: MediaScreen,
    options: {
      title: "Media",
      drawerIcon: ({ color, size }) => (
        <Ionicons name="images-outline" size={size} color={color} />
      ),
    },
  },
  {
    name: "Trends",
    component: Trends,
    options: {
      title: "Trends",
      drawerIcon: ({ color, size }) => (
        <Ionicons name="trending-up-outline" size={size} color={color} />
      ),
    },
  },
  {
    name: "MarketPlace",
    component: MarketScreen,
    options: {
      title: "Market",
      drawerIcon: ({ color, size }) => (
        <Feather name="shopping-cart" size={size} color={color} />
      ),
    },
  },
  {
    name: "Profile",
    component: ProfileScreen,
    options: {
      title: "Your Profile",
      drawerIcon: ({ color, size }) => (
        <Ionicons name="person-outline" size={size} color={color} />
      ),
    },
  },
  {
    name: "Settings",
    component: SettingsScreen,
    options: {
      title: "App Settings",
      drawerIcon: ({ color, size }) => (
        <Ionicons name="settings-outline" size={size} color={color} />
      ),
    },
  },
];

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const [userData, setUserData] = useState(null);
  const { user } = useUser();
  const { signOut } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      try {
        const q = query(
          collection(db, "userPosts"),
          where("uid", "==", user.id)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setUserData(snapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, [user?.id]);

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: theme.colors.background }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <Pressable
          onPress={() => props.navigation.navigate("Profile")}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Avatar.Image
            size={40}
            source={{
              uri:
                userData?.imageUrl ||
                userData?.userImg ||
                "https://via.placeholder.com/150",
            }}
            style={{ borderRadius: 20 }}
          />
          <View>
            <Text
              style={{
                fontWeight: "bold",
                marginLeft: 16,
                fontSize: 20,
                maxWidth: 112,
                color: theme.colors.text,
              }}
              numberOfLines={1}
            >
              {userData?.name || "Anonymous"}
            </Text>
            <Text
              style={{
                fontWeight: "bold",
                marginLeft: 16,
                fontSize: 14,
                color: theme.colors.primary,
                maxWidth: 112,
              }}
              numberOfLines={1}
            >
              @{userData?.nickname || "guest"}
            </Text>
          </View>
        </Pressable>
        <SignedIn>
          <TouchableOpacity
            onPress={async () => {
              try {
                await signOut(); // ✅ properly awaits signOut
                console.log("Signed out successfully");
              } catch (err) {
                console.error("Error signing out:", err);
              }
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 8,
              backgroundColor: "#60A5FA",
              borderRadius: 9999,
            }}
          >
            <FontAwesome name="sign-out" size={16} color="white" />
            <Text style={{ color: "white", marginLeft: 4 }}>Logout</Text>
          </TouchableOpacity>
        </SignedIn>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}
export default function DrawerNavigator() {
  const { currentLevel, setCurrentLevel } = useLevel();
  const { theme } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation, route }) => {
        const isHome = route.name === "Tabs";

        return {
          headerTransparent: true,
          headerTitle: "",
          headerTintColor: theme.colors.text,
          drawerActiveBackgroundColor: theme.colors.card,
          drawerActiveTintColor: theme.colors.onPrimary,
          drawerInactiveTintColor: theme.colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{
                marginLeft: 16,
                borderRadius: 50,
                padding: 4,
                backgroundColor: "gray",
                zIndex: 999, // Ensure it appears above other elements
              }}
            >
              <Ionicons name="menu" size={28} color="white" />
            </TouchableOpacity>
          ),
        };
      }}
    >
      <Drawer.Screen
        name="Tabs"
        component={TabNavigator}
        options={{
          title:
            currentLevel?.value && typeof currentLevel.value === "string"
              ? currentLevel.value.charAt(0).toUpperCase() +
                currentLevel.value.slice(1)
              : "Level",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet" size={size} color={color} />
          ),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Render other drawer screens */}
      {drawerScreens.map((screen) => (
        <Drawer.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Drawer.Navigator>
  );
}
