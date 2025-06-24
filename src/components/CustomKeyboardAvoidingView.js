// components/CustomKeyboardAvoidingView.js
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from "react-native";

export default function CustomKeyboardAvoidingView({ children }) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {/* Wrap children in a View to ensure it's a single element */}
        <View style={{ flex: 1 }}>{children}</View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
