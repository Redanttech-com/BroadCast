// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBWVze7w_xsnG7l_VFpjpy4GqWltV8yY7g",
  authDomain: "deepstate-f3b4b.firebaseapp.com",
  projectId: "deepstate-f3b4b",
  storageBucket: "deepstate-f3b4b.appspot.com",
  messagingSenderId: "666270182752",
  appId: "1:666270182752:web:6a0a69218499cad0c5c205",
};

// ✅ Initialize app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
