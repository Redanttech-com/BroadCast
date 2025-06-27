import "./global.css";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./src/context/ThemeContext";
import { LevelProvider } from "./src/context/LevelContext";
import SignInScreen from "./src/screens/SignInScreen";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as SplashScreen from "expo-splash-screen";
import { MediaProvider } from "./src/context/MediaContext";
import { toastConfig } from "./src/components/ToastConfig";
import Toast from "react-native-toast-message";
import { tokenCache } from "./src/utils/tokenCache";
import RootNavigator from "./src/navigation/RootNavigator";
import { navigationRef } from "./src/navigation/TabNavigator";
import { FollowProvider } from "./src/context/FollowContext";
import { MenuProvider } from "react-native-popup-menu";
import { SeenStatusProvider } from "./src/context/SeenStatusContext";

// Prevent splash screen from auto hiding
SplashScreen.preventAutoHideAsync();

function MainApp() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        {isSignedIn ? <RootNavigator /> : <SignInScreen />}
      </NavigationContainer>
      <Toast config={toastConfig} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        publishableKey="pk_test_cmVuZXdpbmctbGFtcHJleS0yMS5jbGVyay5hY2NvdW50cy5kZXYk"
        tokenCache={tokenCache}
      >
        <ThemeProvider>
          <LevelProvider>
            <FollowProvider>
              <MediaProvider>
                <MenuProvider>
                  <SeenStatusProvider>
                    <MainApp />
                  </SeenStatusProvider>
                </MenuProvider>
              </MediaProvider>
            </FollowProvider>
          </LevelProvider>
        </ThemeProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
