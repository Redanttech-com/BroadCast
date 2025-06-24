// import React, { createContext, useContext, useState, useEffect } from "react";
// import {
//   collection,
//   query,
//   where,
//   onSnapshot,
//   getDocs,
//   addDoc,
//   deleteDoc,
//   doc,
// } from "firebase/firestore";
// import { db } from "../services/firebase";
// import { useUser } from "@clerk/clerk-expo";

// const FollowContext = createContext();
// export const useFollow = () => useContext(FollowContext);

// export const FollowProvider = ({ children }) => {
//   const { user } = useUser();
//   const [userDetails, setUserDetails] = useState(null);
//   const [allUsers, setAllUsers] = useState([]);
//   const [hasFollowed, setHasFollowed] = useState({});
//   const [followloading, setFollowLoading] = useState({});
//   const [followersCount, setFollowersCount] = useState(0);
//   const [followingCount, setFollowingCount] = useState(0);
//   const { uid } = route.params || {};


//   useEffect(() => {
//     if (!userDetails?.uid) return;

//     // Real-time listener for followers
//     const followersQuery = query(
//       collection(db, "following"),
//       where("followingId", "==", userDetails.uid)
//     );
//     const unsubscribeFollowers = onSnapshot(followersQuery, (snapshot) => {
//       setFollowersCount(snapshot.size);
//     });

//     // Real-time listener for following
//     const followingQuery = query(
//       collection(db, "following"),
//       where("followerId", "==", userDetails.uid)
//     );
//     const unsubscribeFollowing = onSnapshot(followingQuery, (snapshot) => {
//       setFollowingCount(snapshot.size);
//     });

//     // Clean up listeners when component unmounts or uid changes
//     return () => {
//       unsubscribeFollowers();
//       unsubscribeFollowing();
//     };
//   }, [userDetails?.uid]);
  
  


//   // Fetch current user's Firestore data
//   useEffect(() => {
//     if (!uid) return;

//     const unsubscribe = onSnapshot(doc(db, "users", uid), (docSnap) => {
//       if (docSnap.exists()) {
//         setUserDetails(docSnap.data());
//       }
//     });

//     return unsubscribe;
//   }, [uid]);

//   // Fetch all users
//   useEffect(() => {
//     const q = query(collection(db, "users"));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const usersData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setAllUsers(usersData);
//     });

//     return unsubscribe;
//   }, []);

//   // Fetch follow status for all users
//   useEffect(() => {
//     if (!userDetails?.uid || allUsers.length === 0) return;

//     const fetchFollowStatus = async () => {
//       const status = {};

//       const q = query(
//         collection(db, "following"),
//         where("followerId", "==", userDetails.uid)
//       );
//       const snapshot = await getDocs(q);

//       snapshot.forEach((doc) => {
//         const data = doc.data();
//         if (data.followingId) {
//           status[data.followingId] = true;
//         }
//       });

//       setHasFollowed(status);
//     };

//     fetchFollowStatus();
//   }, [userDetails, allUsers]);


// const followMember = async (targetUid) => {
//   if (!user?.id || !targetUid) return;

//   setFollowLoading((prev) => ({ ...prev, [targetUid]: true }));

//   try {
//     const q = query(
//       collection(db, "following"),
//       where("followerId", "==", user.id),
//       where("followingId", "==", targetUid)
//     );
//     const snapshot = await getDocs(q);

//     if (!snapshot.empty) {
//       const deletePromises = snapshot.docs.map((docSnap) =>
//         deleteDoc(doc(db, "following", docSnap.id))
//       );
//       await Promise.all(deletePromises);
//       setHasFollowed((prev) => ({ ...prev, [targetUid]: false }));
//     } else {
//       await addDoc(collection(db, "following"), {
//         followerId: user.id,
//         followingId: targetUid,
//         timeStamp: new Date(),
//       });
//       setHasFollowed((prev) => ({ ...prev, [targetUid]: true }));
//     }
//   } catch (error) {
//     console.error("Follow/unfollow error:", error);
//   } finally {
//     setFollowLoading((prev) => ({ ...prev, [targetUid]: false }));
//   }
// };
  
//   return (
//     <FollowContext.Provider
//       value={{
//         hasFollowed,
//         userDetails,
//         followMember,
//         followloading,
//         followersCount,
//         followingCount,
//       }}
//     >
//       {children}
//     </FollowContext.Provider>
//   );
// };

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useUser } from "@clerk/clerk-expo";

const FollowContext = createContext();
export const useFollow = () => useContext(FollowContext);

export const FollowProvider = ({ children, uid }) => {
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState(null);
  const [hasFollowed, setHasFollowed] = useState({});
  const [followloading, setFollowLoading] = useState({});
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Fetch current user's Firestore data
  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(doc(db, "users", uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
      }
    });

    return unsubscribe;
  }, [uid]);

  // Real-time count updates
  useEffect(() => {
    if (!userDetails?.uid) return;

    const followersQuery = query(
      collection(db, "following"),
      where("followingId", "==", userDetails.uid)
    );
    const unsubscribeFollowers = onSnapshot(followersQuery, (snapshot) => {
      setFollowersCount(snapshot.size);
    });

    const followingQuery = query(
      collection(db, "following"),
      where("followerId", "==", userDetails.uid)
    );
    const unsubscribeFollowing = onSnapshot(followingQuery, (snapshot) => {
      setFollowingCount(snapshot.size);
    });

    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  }, [userDetails?.uid]);

  // Fetch current user's followings (for toggle state)
  useEffect(() => {
    if (!userDetails?.uid) return;

    const fetchFollowStatus = async () => {
      const status = {};

      const q = query(
        collection(db, "following"),
        where("followerId", "==", userDetails.uid)
      );
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.followingId) {
          status[data.followingId] = true;
        }
      });

      setHasFollowed(status);
    };

    fetchFollowStatus();
  }, [userDetails?.uid]);

  const followMember = async (targetUid) => {
    if (!user?.id || !targetUid) return;

    setFollowLoading((prev) => ({ ...prev, [targetUid]: true }));

    try {
      const q = query(
        collection(db, "following"),
        where("followerId", "==", user.id),
        where("followingId", "==", targetUid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const deletePromises = snapshot.docs.map((docSnap) =>
          deleteDoc(doc(db, "following", docSnap.id))
        );
        await Promise.all(deletePromises);
        setHasFollowed((prev) => ({ ...prev, [targetUid]: false }));
      } else {
        await addDoc(collection(db, "following"), {
          followerId: user.id,
          followingId: targetUid,
          timeStamp: new Date(),
        });
        setHasFollowed((prev) => ({ ...prev, [targetUid]: true }));
      }
    } catch (error) {
      console.error("Follow/unfollow error:", error);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetUid]: false }));
    }
  };

  return (
    <FollowContext.Provider
      value={{
        hasFollowed,
        userDetails,
        followMember,
        followloading,
        followersCount,
        followingCount,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
};
