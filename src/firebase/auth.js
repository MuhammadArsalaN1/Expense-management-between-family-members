import { auth } from "./config";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// 🔐 Login
export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// 🚪 Logout
export const logoutUser = () => signOut(auth);

// 🔄 Auth Listener
export const listenAuth = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};