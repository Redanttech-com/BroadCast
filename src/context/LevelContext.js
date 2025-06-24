import { useUser } from "@clerk/clerk-expo";
import { doc, onSnapshot } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../services/firebase";

const LevelContext = createContext();

export const LevelProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [currentLevel, setCurrentLevel] = useState({
    type: "home",
    value: "home",
  });
  const { user } = useUser();
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingUserDetails, setLoadingUserDetails] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoadingUser(true);
      setLoadingUserDetails(true);
      return;
    }

    const userRef = doc(db, "users", user.id);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        }
        setLoadingUserDetails(false);
      },
      (error) => {
        console.error("Error fetching user data:", error);
        setLoadingUserDetails(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  

  return (
    <LevelContext.Provider
      value={{
        userDetails,
        setUserDetails,
        currentLevel,
        setCurrentLevel,
        loadingUser,
        setLoadingUser,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => {
  const context = useContext(LevelContext);
  if (!context) {
    throw new Error("useLevel must be used within a LevelProvider");
  }
  return context;
};
