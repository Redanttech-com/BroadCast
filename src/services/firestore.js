import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export const listenToPosts = (currentLevel, callback) => {
  const postsRef = collection(
    db,
    currentLevel?.type,
    currentLevel?.value,
    "posts"
  );

  const postsQuery = query(postsRef, orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
    const posts = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    callback(posts);
  });

  return unsubscribe;
};

export const listenToNews = (currentLevel, callback) => {
  const postsRef = collection(
    db,
    currentLevel?.type,
    currentLevel?.value,
    "posts"
  );

  const postsQuery = query(
    postsRef,
    where("category", "!=", "Personal Account"),
    // orderBy("category"),
    // orderBy("timestamp", "desc")
  );

  const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
    const posts = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(posts);
  });

  return unsubscribe;
};






// export const listenToComments = (postId, callback) => {
//   if (!postId) {
//     console.warn("postId is required for listenToComments");
//     return () => {}; // <-- Return a no-op function
//   }

//   try {
//     const commentsRef = collection(db, "comments", postId, "comments");
//     const q = query(commentsRef, orderBy("timestamp", "desc"));

//     const unsubscribe = onSnapshot(q, (querySnapshot) => {
//       const comments = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       callback(comments);
//     });

//     return unsubscribe;
//   } catch (error) {
//     console.error("Error listening to comments:", error);
//     return () => {}; // <-- Still return no-op on error
//   }
// };

export const listenToCommentCount = (postId, callback) => {
  if (!postId || typeof postId !== "string") {
    console.warn("Invalid postId passed to listenToCommentCount:", postId);
    return () => {};
  }

  try {
    const commentsRef = collection(db, "comments", postId, "comments");

    console.log(
      "Subscribing to comment count at:",
      `comments/${postId}/comments`
    );

    const unsubscribe = onSnapshot(
      commentsRef,
      (snapshot) => {
        callback(snapshot.size);
      },
      (error) => {
        console.error("Firestore listener error:", error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Failed to subscribe to comment count:", error);
    return () => {};
  }
};

export const listenToMarketPosts = (userId, callback) => {
  const postsRef = collection(db, "market");

  const postsQuery = query(postsRef, orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
    const posts = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const postData = docSnap.data();
        const postId = docSnap.id;

        // Check if the current user liked this post
        const likeDocRef = doc(db, "market", postId, "likes", userId);
        const likeSnap = await getDoc(likeDocRef);
        const liked = likeSnap.exists();

        return {
          id: postId,
          ...postData,
          liked,
        };
      })
    );

    callback(posts);
  });

  return unsubscribe;
};


export const listenToStatus = (setPosts, setLoadingStatus) => {
  const q = query(collection(db, "status"), orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const latestStatuses = new Map();

    snapshot.docs.forEach((doc) => {
      const post = { id: doc.id, ...doc.data() };

      if (post.timestamp) {
        const postTime = dayjs(post.timestamp.toDate());
        const now = dayjs();

        if (now.diff(postTime, "hour") >= 24) {
          deletePostAfter24Hours(post.id, post.timestamp);
          return;
        }
      }

      if (!latestStatuses.has(post.uid)) {
        latestStatuses.set(post.uid, post);
      }
    });

    setPosts(Array.from(latestStatuses.values()));
    setLoadingStatus(false);
  });

  return () => unsubscribe();
};

export const deletePostAfter24Hours = async (postId) => {
  try {
    const postRef = doc(db, "status", postId);
    await deleteDoc(postRef);
    console.log(`Deleted status ${postId} after 24 hours`);
  } catch (error) {
    console.error("Failed to delete status:", error);
  }
};

const getPostsQuery = (level, levelId) => {
  const baseRef = collection(db, "posts");

  const filters = [];
  if (level === "county") {
    filters.push(where("location.county", "==", levelId));
  } else if (level === "constituency") {
    filters.push(where("location.constituency", "==", levelId));
  } else if (level === "ward") {
    filters.push(where("location.ward", "==", levelId));
  }

  return query(baseRef, ...filters, orderBy("createdAt", "desc"));
};

// 🔥 Main listener function
// export const listenToMediaPosts = (
//   currentLevel,
//   setMediaPosts,
//   setLoading = () => {}
// ) => {
//   const { level, county, constituency, ward } = currentLevel;
//   const levelId = ward || constituency || county || null;

//   const postsQuery = getPostsQuery(level, levelId);

//   const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
//     const allPosts = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     // 🔁 Normalize media into a consistent `media[]` array
//     const mediaOnly = allPosts
//       .map((post) => {
//         const media = [];

//         if (Array.isArray(post.images)) {
//           media.push(...post.images.map((url) => ({ type: "image", url })));
//         } else if (typeof post.images === "string") {
//           media.push({ type: "image", url: post.images });
//         }

//         if (typeof post.video === "string") {
//           media.push({ type: "video", url: post.video });
//         }

//         if (typeof post.videos === "string") {
//           media.push({ type: "video", url: post.videos });
//         }

//         return {
//           ...post,
//           media,
//         };
//       })
//       .filter((post) => post.media && post.media.length > 0)
//       .sort((a, b) => {
//         const aTime = a.createdAt?.toMillis?.() || 0;
//         const bTime = b.createdAt?.toMillis?.() || 0;
//         return bTime - aTime;
//       });

//     setMediaPosts(mediaOnly);
//     setLoading(false);
//   });

//   return unsubscribe;
// };

export const listenToMembersById = (setMembers) => {
  const postsRef = collection(db, "users");

  // Start listening for real-time updates
  const unsubscribe = onSnapshot(postsRef, (snapshot) => {
    const members = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMembers(members);
  });

  // Return unsubscribe function for cleanup
  return unsubscribe;
};

// // Follow a user
export const followUser = async (currentUserId, targetUserId) => {
  await setDoc(doc(db, "userPosts", targetUserId, "followers", currentUserId), {
    timestamp: Date.now(),
  });

  await setDoc(doc(db, "userPosts", currentUserId, "following", targetUserId), {
    timestamp: Date.now(),
  });
};

// Unfollow a user
export const unfollowUser = async (currentUserId, targetUserId) => {
  await deleteDoc(
    doc(db, "userPosts", targetUserId, "followers", currentUserId)
  );
  await deleteDoc(
    doc(db, "userPosts", currentUserId, "following", targetUserId)
  );
};

// Check if current user is following another
export const checkIfFollowing = async (currentUserId, targetUserId) => {
  const docSnap = await getDoc(
    doc(db, "users", currentUserId, "following", targetUserId)
  );
  return docSnap.exists();
};

export const getFollowers = async (userId) => {
  const followersRef = collection(db, "users", userId, "followers");
  const snapshot = await getDocs(followersRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getFollowing = async (userId) => {
  const followingRef = collection(db, "users", userId, "following");
  const snapshot = await getDocs(followingRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const listenToReports = (userId, callback) => {
  if (!userId || !callback) return () => {}; // ✅ Always return a function

  const reportsRef = collection(db, "reports", userId, "reports");

  const unsubscribe = onSnapshot(reportsRef, (snapshot) => {
    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(reports);
  });

  return unsubscribe;
};

export default function useTrendingPosts(currentLevel) {
  const [trendPosts, setTrendPosts] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentLevel?.type || !currentLevel?.value) return;

    setLoading(true);
    const postsRef = collection(
      db,
      currentLevel.type,
      currentLevel.value,
      "posts"
    );
    const q = query(postsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsData = snapshot.docs.map((doc) => doc.data());

        // Trending score based on likes, comments, and views
        const sorted = postsData.sort((a, b) => {
          const scoreA =
            (a.likesCount || 0) * 2 +
            (a.commentsCount || 0) * 3 +
            (a.viewsCount || 0);
          const scoreB =
            (b.likesCount || 0) * 2 +
            (b.commentsCount || 0) * 3 +
            (b.viewsCount || 0);
          return scoreB - scoreA;
        });

        setTrendPosts(sorted);

        // Extract trending hashtags
        const topicsMap = {};
        postsData.forEach((post) => {
          const hashtags = post.text?.match(/#\w+/g) || [];
          hashtags.forEach((tag) => {
            topicsMap[tag] = (topicsMap[tag] || 0) + 1;
          });
        });
        const sortedTopics = Object.entries(topicsMap)
          .sort((a, b) => b[1] - a[1])
          .map(([tag]) => tag);
        setTrendingTopics(sortedTopics.slice(0, 5));

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentLevel]);

  return { trendPosts, trendingTopics, loading };
}

export function listenToAllUserPosts(userId, callback) {
  const q = query(collection(db, "posts"), where("userId", "==", userId));

  return onSnapshot(q, (snapshot) => {
    const userPosts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(userPosts);
  });
}

export const trackPostView = async (pstId, userId, currentLevel) => {
  if (!pstId || !userId || !currentLevel) return;

  try {
    const postRef = doc(
      db,
      currentLevel.type,
      currentLevel.value,
      "posts",
      pstId
    );
    const viewRef = doc(postRef, "views", userId);
    const viewSnap = await getDoc(viewRef);

    if (!viewSnap.exists()) {
      await setDoc(viewRef, {
        userId,
        timestamp: Timestamp.now(),
      });

      const viewsCollection = collection(postRef, "views");
      const snapshot = await getCountFromServer(viewsCollection);
      const count = snapshot.data().count;

      await updateDoc(postRef, {
        viewCount: count,
      });
    }
  } catch (error) {
    console.error("Error tracking post view:", error);
  }
};


