// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "mern-estate-f2d1e.firebaseapp.com",
    projectId: "mern-estate-f2d1e",
    storageBucket: "mern-estate-f2d1e.firebasestorage.app",
    messagingSenderId: "1075389933662",
    appId: "1:1075389933662:web:af72a25cb050ebd718eccf"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);