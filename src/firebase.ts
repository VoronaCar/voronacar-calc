import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAwbaGZkzyWuE_Tup5PX-RSF-YUnl3HlAs",
  authDomain: "voronacar-calc-app.firebaseapp.com",
  projectId: "voronacar-calc-app",
  storageBucket: "voronacar-calc-app.firebasestorage.app",
  messagingSenderId: "1080132008082",
  appId: "1:1080132008082:web:ca52224322de6bf3254e4b",
  measurementId: "G-199TWF1377"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);