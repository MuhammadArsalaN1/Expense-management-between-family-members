import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
} from "@mui/material";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

// ✅ FIXED IMPORT (based on your actual file path)
import ReceiptTemplate from "../utils/ReceiptTemplate";

// ✅ Styled PDF system
import { generateStyledPDF } from "../utils/generateStyledPDF";

export default function Receipts() {
  const [text, setText] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // 🔥 REALTIME FETCH RECEIPTS
  useEffect(() => {
    const q = query(
      collection(db, "receipts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReceipts(data);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 SAVE MANUAL RECEIPT
  const handleAdd = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "receipts"), {
      notes: text,
      type: "manual",
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  // 🔥 STYLED PDF DOWNLOAD
  const handleStyledDownload = async (id) => {
    try {
      setLoadingId(id);
      await generateStyledPDF(id);
    } catch (err) {
      console.error("PDF Error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Layout>
      {/* 🔹 Manual Entry */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            Add Manual Receipt
          </Typography>

          <TextField
            fullWidth
            label="Enter Notes / Receipt Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{ mt: 2 }}
          />

          <Button
            sx={{ mt: 2 }}
            onClick={handleAdd}
            variant="contained"
          >
            Save Receipt
          </Button>
        </CardContent>
      </Card>

      {/* 🔹 Receipts List */}
      <Grid container spacing={2}>
        {receipts.map((r) => (
          <Grid item xs={12} md={6} lg={4} key={r.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardContent>

                {/* ✅ MODERN RECEIPT UI */}
                <ReceiptTemplate receipt={r} />

                {/* 🔥 ACTION BUTTON */}
                <Box mt={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleStyledDownload(r.id)}
                    disabled={loadingId === r.id}
                  >
                    {loadingId === r.id
                      ? "Generating..."
                      : "Download Styled"}
                  </Button>
                </Box>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}