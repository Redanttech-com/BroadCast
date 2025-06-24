// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDlVU4gg2hDjmxHaLmrU7BwBH0P2oXAMSg",
  authDomain: "broadcast-ddeb4.firebaseapp.com",
  projectId: "broadcast-ddeb4",
  storageBucket: "broadcast-ddeb4.firebasestorage.app",
  messagingSenderId: "803737868675",
  appId: "1:803737868675:web:28f8fab8f02aff2021feb6",
};


// ✅ Initialize app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
