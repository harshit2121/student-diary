// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace these values with your Firebase project's config
const firebaseConfig = {
  apiKey: "AIzaSyDWRoV5UY5xD9q9R8cqNRcbRMv0J2luJFE",
  authDomain: "studentdiary-4c940.firebaseapp.com",
  projectId: "studentdiary-4c940",
  storageBucket: "studentdiary-4c940.firebasestorage.app",
  messagingSenderId: "31901529343",
  appId: "1:31901529343:web:84cee884606ef5b44ac8ca",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

///