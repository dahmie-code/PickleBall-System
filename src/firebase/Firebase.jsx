// Import the functions you need from the SDKs you need
import { getDatabase, ref, push, set, get, update, remove, child} from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwjyrLkPKDYUFh7Urt70Vc0bCMOkPZa58",
  authDomain: "pickleball-d49a6.firebaseapp.com",
  projectId: "pickleball-d49a6",
  storageBucket: "pickleball-d49a6.appspot.com",
  messagingSenderId: "916793514220",
  appId: "1:916793514220:web:4665bffce8db59170e2dc9",
  measurementId: "G-CTXJTFCB6H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

export {
    auth, db, ref, push, set, get, update, remove,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut, child,
  };
  