import React, { useEffect } from "react";
import { View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useLevel } from "../context/LevelContext";
import OptionScreen from "../screens/OptionScreen";
import StatusViewScreen from "../screens/Status/StatusViewScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import StatusInput from "../screens/Status/StatusInput";
import ReciteScreen from "../screens/ReciteScreen";
import DrawerNavigator from "./DrawerNavigator";
import LocationSelectionScreen from "../screens/LocationSelectionScreen";
import FollowScreen from "../screens/FollowScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ProductOptionsScreen from "../screens/MarketScreens/ProductOptionsScreen";
import { ActivityIndicator } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";
import StatusOptions from "../screens/Status/StatusOptions";
import UserScreen from "../screens/UserScreen";
import CommentScreen from "../screens/CommentScreens/CommentScreen";
import FullMedia from "../screens/FullMedia";
import SellForm from "../screens/MarketScreens/SellForm";
import ProductView from "../screens/MarketScreens/ProductView";
import ChatRoom from "../screens/ChatScreens/ChatRoom";
import ChatScreen from "../screens/ChatScreens/ChatScreen";
import MarketScreen from "../screens/MarketScreens/MarketScreen";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { currentLevel, userDetails, loadingUser, setLoadingUser } = useLevel();
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingUser(false);
    }, 3000); // loader will be visible for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  // Add this: wait for loading OR userDetails state to resolve before rendering
  if (loadingUser || userDetails === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color={theme.colors.text} />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {userDetails ? (
        <>
          <Stack.Screen
            name="DrawerNavigator"
            component={DrawerNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FullMedia"
            component={FullMedia}
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="CommentScreen"
            component={CommentScreen}
            options={{
              presentation: "modal",
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="FollowScreen"
            component={FollowScreen}
            options={{
              presentation: "modal",
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{
              presentation: "modal",
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="OptionScreen"
            component={OptionScreen}
            options={{
              presentation: "transparentModal",
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="StatusOptions"
            component={StatusOptions}
            options={{
              presentation: "transparentModal",
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="UserScreen"
            component={UserScreen}
            options={{
              presentation: "transparentModal",
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="MarketScreen"
            component={MarketScreen}
            options={{
              presentation: "transparentModal",
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="ReciteScreen"
            component={ReciteScreen}
            options={{
              presentation: "transparentModal",
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="SellForm"
            component={SellForm}
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="ProductView"
            component={ProductView}
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="ChatRoom"
            component={ChatRoom}
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="ProductOptionsScreen"
            component={ProductOptionsScreen}
            options={{
              headerShown: false,
              presentation: "transparentModal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="StatusViewScreen"
            component={StatusViewScreen}
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="VerifyEmailScreen"
            component={VerifyEmailScreen}
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="StatusInput"
            component={StatusInput}
            options={{ headerShown: false, presentation: "modal" }}
          />
        </>
      ) : (
        <Stack.Screen
          name="LocationSelectionScreen"
          component={LocationSelectionScreen}
          options={{ headerShown: false, presentation: "modal" }}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
