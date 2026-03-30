import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Box,
  Chip,
} from "@mui/material";

import dayjs from "dayjs";

export default function Recurring() {
  const [list, setList] = useState([]);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "",
    subcategory: "",
    paidBy: "",
    paymentMethod: "",
    frequency: "monthly",
  });

  // 🔄 REALTIME LIST
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "recurring_expenses"), (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setList(data);
    });

    return () => unsub();
  }, []);

  // 🧠 SAFE AUTO SYNC TO EXPENSES
  useEffect(() => {
    const runAutoInsert = async () => {
      for (const item of list) {
        const today = dayjs();
        const todayStr = today.format("YYYY-MM-DD");

        const last = item.lastAdded ? dayjs(item.lastAdded) : null;

        let shouldAdd = false;

        if (!last) {
          shouldAdd = true;
        } else {
          if (item.frequency === "daily" && today.diff(last, "day") >= 1)
            shouldAdd = true;

          if (item.frequency === "monthly" && today.diff(last, "month") >= 1)
            shouldAdd = true;
        }

        if (!shouldAdd) continue;

        // 🚫 DUPLICATE PROTECTION (IMPORTANT)
        const q = query(
          collection(db, "expenses"),
          where("subcategory", "==", item.subcategory),
          where("date", "==", todayStr),
          where("recurring", "==", true)
        );

        const snap = await getDocs(q);

        if (!snap.empty) continue; // already added

        // ➕ ADD EXPENSE
        await addDoc(collection(db, "expenses"), {
          amount: item.amount,
          tax: 0,
          total: Number(item.amount),
          category: item.category,
          subcategory: item.subcategory,
          paidBy: item.paidBy,
          paymentMethod: item.paymentMethod,
          date: todayStr,
          recurring: true,
        });

        // 🔄 UPDATE LAST ADDED
        await updateDoc(doc(db, "recurring_expenses", item.id), {
          lastAdded: todayStr,
        });
      }
    };

    if (list.length) runAutoInsert();
  }, [list]);

  // ➕ ADD RECURRING (WITH DUPLICATE CHECK)
  const handleAdd = async () => {
    if (!form.name || !form.amount) {
      alert("Fill required fields");
      return;
    }

    const q = query(
      collection(db, "recurring_expenses"),
      where("subcategory", "==", form.subcategory),
      where("amount", "==", Number(form.amount))
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      alert("Already exists");
      return;
    }

    await addDoc(collection(db, "recurring_expenses"), {
      ...form,
      amount: Number(form.amount),
      lastAdded: null,
    });

    setForm({
      name: "",
      amount: "",
      category: "",
      subcategory: "",
      paidBy: "",
      paymentMethod: "",
      frequency: "monthly",
    });
  };

  // 🗑 DELETE
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "recurring_expenses", id));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <Grid container spacing={3}>
        
        {/* 🔹 FORM */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6">Add Recurring Expense</Typography>

              <TextField
                fullWidth
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />

              <TextField
                fullWidth
                label="Amount"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />

              <TextField
                select
                fullWidth
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                sx={{ mt: 2 }}
              >
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="office">Office</MenuItem>
                <MenuItem value="farm">Farm</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Subcategory"
                name="subcategory"
                value={form.subcategory}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />

              <TextField
                select
                fullWidth
                label="Frequency"
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                sx={{ mt: 2 }}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </TextField>

              <Button
                fullWidth
                sx={{ mt: 2 }}
                variant="contained"
                onClick={handleAdd}
              >
                Add Recurring
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 🔹 LIST */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recurring List</Typography>

              {list.length === 0 && (
                <Typography mt={2} color="text.secondary">
                  No recurring expenses yet
                </Typography>
              )}

              <Box mt={2}>
                {list.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography fontWeight={600}>
                        {item.subcategory}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {item.category} • {item.frequency}
                      </Typography>

                      <Box mt={0.5}>
                        <Chip label="Recurring" size="small" color="warning" />
                      </Box>
                    </Box>

                    <Box textAlign="right">
                      <Typography fontWeight={700}>
                        PKR {item.amount}
                      </Typography>

                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Layout>
  );
}