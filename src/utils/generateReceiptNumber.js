import { doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase/config";

export const generateReceiptNumber = async () => {
  const counterRef = doc(db, "counters", "receipts");

  try {
    const newNumber = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      if (!counterDoc.exists()) {
        throw "Counter document does not exist!";
      }

      const current = counterDoc.data().lastNumber || 0;
      const next = current + 1;

      transaction.update(counterRef, { lastNumber: next });

      return next;
    });

    const year = new Date().getFullYear();

    return `RCPT-${year}-${String(newNumber).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating receipt number:", error);
    throw error;
  }
};