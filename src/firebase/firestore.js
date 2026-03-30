import { db } from "./config";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

// 🔹 ADD DATA
export const addData = async (collectionName, data) => {
  await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date(),
  });
};

// 🔹 REALTIME FETCH
export const subscribeData = (collectionName, callback) => {
  const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });
};