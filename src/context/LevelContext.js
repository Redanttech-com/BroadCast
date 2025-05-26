import { useUser } from "@clerk/clerk-expo";
import { collection, getDocs, query, where } from "firebase/firestore";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "userPosts"),
          where("uid", "==", user.id)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUserDetails(querySnapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user?.id]);

  return (
    <LevelContext.Provider
      value={{ userDetails, setUserDetails, currentLevel, setCurrentLevel, loading, setLoading }}
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
