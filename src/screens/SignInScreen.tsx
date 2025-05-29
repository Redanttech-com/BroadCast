import React, { useCallback, useEffect, useRef } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO } from "@clerk/clerk-expo";
import {
  Text,
  TextInput,
  Button,
  View,
  Animated,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

export default function Page() {
  useWarmUpBrowser();

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO();

  const onPress = useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy: "oauth_google",
          // For web, defaults to current path
          // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
          // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
          redirectUrl: AuthSession.makeRedirectUri(),
        });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  }, []);

  const { isLoaded, signUp, setActive } = useSignUp();
  //const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        //router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <>
        <Text>Verify your email</Text>
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#666666"
          onChangeText={(code) => setCode(code)}
        />
        <Button title="Verify" onPress={onVerifyPress} />
      </>
    );
  }

  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animateCircle = (scale: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 0.5, // Shrinking effect
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateCircle(scale1, 0);
    animateCircle(scale2, 200);
    animateCircle(scale3, 400);
  }, []);

  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <View className="w-full justify-center mt-16 flex-row items-center relative">
          <Animated.View
            style={{ transform: [{ scale: scale1 }] }}
            className="border-green-600 h-36 w-36 rounded-full border absolute"
          />
          <Animated.View
            style={{ transform: [{ scale: scale2 }] }}
            className="border-gray-900 h-32 w-32 rounded-full border absolute"
          />
          <Animated.View
            style={{ transform: [{ scale: scale3 }] }}
            className="border-red-600 h-28 w-28 rounded-full border absolute"
          />
          <View>
            <Text style={{ color: theme.colors.text }}>KENYA</Text>
          </View>
        </View>

        <View className="flex-row items-center mt-20 w-full justify-center">
          <Text
            style={{
              color: theme.colors.text,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            Sign Up to Broadcast
          </Text>
          <Image
            source={require("../assets/brLogo.jpg")}
            className="h-10 w-10 rounded-full ml-3"
          />
        </View>

        <View className="w-full space-y-4 mt-6 gap-3">
          <View className="border p-3 rounded-full border-gray-200 flex-row items-center gap-3">
            <Ionicons name="person" size={24} color="gray" />
            <TextInput
              value={emailAddress}
              placeholder="Enter email"
              placeholderTextColor="gray"
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 h-10 text-base"
              style={{ paddingVertical: 0 }}
            />
          </View>

          <View className="border p-3 rounded-full border-gray-200 flex-row items-center gap-3">
            <Ionicons name="lock-closed" size={24} color="gray" />
            <TextInput
              value={password}
              placeholder="Enter password"
              placeholderTextColor="gray"
              secureTextEntry
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 h-10 text-base"
              style={{ paddingVertical: 0 }}
            />
          </View>

          <Pressable
            onPress={onSignUpPress}
            className="bg-slate-900 items-center p-5 rounded-lg w-full"
          >
            <Text className="text-white font-bold">Sign Up</Text>
          </Pressable>
        </View>

        {/* OR Divider */}
        <View className="flex-row items-center my-4 w-full">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-2 text-gray-500">OR</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* OAuth Buttons */}
        <OAuthButton
          onPress={() => onPress()}
          icon={<AntDesign name="google" size={24} color="white" />}
          text="Continue with Google"
          backgroundColor="#DB4437"
        />
        {/* <OAuthButton
        //  onPress={() => onPress()}
          icon={<FontAwesome name="facebook" size={24} color="white" />}
          text="Continue with Facebook"
          backgroundColor="#3b5998"
        />
        {Platform.OS === "ios" && (
          <OAuthButton
          //  onPress={() => onPress()}
            icon={<Ionicons name="logo-apple" size={24} color="white" />}
            text="Continue with Apple"
            backgroundColor="#000000"
          />
        )} */}
      </View>
    </SafeAreaView>
  );
}

function OAuthButton({ onPress, icon, text, backgroundColor }) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        {icon}
        <Text style={styles.buttonText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: "center",
  },
  button: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "600",
  },
});
