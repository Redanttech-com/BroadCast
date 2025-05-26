import React, { createContext, useState, useContext, useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Create a Context for Authentication
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.log("Error checking user", error);
      }
    };
    checkUser();
  }, []);

  const signIn = async () => {
    try {
      const response = await GoogleSignin.signIn();
      setUser(response.user); // Save the user to state
    } catch (error) {
      console.error("Sign-in error", error);
    }
  };

  const signOut = async () => {
    await GoogleSignin.signOut();
    setUser(null); // Set user to null on sign-out
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
