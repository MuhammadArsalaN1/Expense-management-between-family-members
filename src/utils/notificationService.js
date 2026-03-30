import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

// 🔥 SEND TO ALL OTHER USERS
export const notifyOthers = async ({
  currentUser,
  title,
  message,
  type,
  extra = {},
}) => {
  try {
    // get all users
    const usersSnap = await getDocs(collection(db, "users"));

    const promises = usersSnap.docs.map((doc) => {
      const user = doc.data();

      // ❌ skip current user
      if (user.uid === currentUser.uid) return null;

      return addDoc(collection(db, "notifications"), {
        userId: user.uid, // 🔥 send to OTHER user
        title,
        message,
        type,
        isRead: false,
        createdAt: serverTimestamp(),
        ...extra,
      });
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Notification Error:", error);
  }
};