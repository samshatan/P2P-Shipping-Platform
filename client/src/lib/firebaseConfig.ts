import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration from your earlier message
const firebaseConfig = {
  apiKey: "AIzaSyB-DLa5mrQKB6etN9pnIDCDiiOL9eOcVbI",
  authDomain: "parcel-ec491.firebaseapp.com",
  projectId: "parcel-ec491",
  storageBucket: "parcel-ec491.firebasestorage.app",
  messagingSenderId: "99889730477",
  appId: "1:99889730477:web:a09d19c98e00d4f9fa0724",
  measurementId: "G-40J27PRPJ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and export it
export const auth = getAuth(app);
export default app;
