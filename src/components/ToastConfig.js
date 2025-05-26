import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "green", backgroundColor: "#e6ffe6" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "green",
      }}
      text2Style={{
        fontSize: 14,
        color: "black",
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "red", backgroundColor: "#ffe6e6" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "red",
      }}
      text2Style={{
        fontSize: 14,
        color: "black",
      }}
    />
  ),

  warn: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "orange", backgroundColor: "#fff5e6" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "orange",
      }}
      text2Style={{
        fontSize: 14,
        color: "black",
      }}
    />
  ),

  update: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#007bff", backgroundColor: "#e6f0ff" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#007bff",
      }}
      text2Style={{
        fontSize: 14,
        color: "black",
      }}
    />
  ),
};
