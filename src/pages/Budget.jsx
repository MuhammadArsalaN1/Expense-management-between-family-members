import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { db, auth } from "../firebase/config";

// 🔔 NOTIFICATION
import { notifyOthers } from "../utils/notificationService";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
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
  Stack,
  Divider,
} from "@mui/material";

import dayjs from "dayjs";

// 👤 USER MAP
const getUserName = (email) => {
  const map = {
    "arsalanch336@gmail.com": "Arsalan",
    "mohomadrehan12@gmail.com": "Rehan",
  };
  return map[email] || email || "Unknown";
};

export default function Budget() {
  const [form, setForm] = useState({
    personal: "",
    office: "",
    farm: "",
  });

  const [entries, setEntries] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  const currentMonth = dayjs().format("YYYY-MM");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const total =
    Number(form.personal || 0) +
    Number(form.office || 0) +
    Number(form.farm || 0);

  // 🔥 REALTIME ENTRIES
  useEffect(() => {
    const q = query(
      collection(db, "budget_entries"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      setEntries(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });
  }, []);

  // 🔥 REALTIME MONTH TOTAL
  useEffect(() => {
    const q = query(
      collection(db, "budgets"),
      where("month", "==", currentMonth)
    );

    return onSnapshot(q, (snap) => {
      if (!snap.empty) setMonthlyBudget(snap.docs[0].data());
      else setMonthlyBudget(null);
    });
  }, [currentMonth]);

  // 🧾 LOG FUNCTION
  const addLog = async (type, entry, user) => {
    await addDoc(collection(db, "budget_logs"), {
      type,
      month: entry.month,
      amount: entry.total,
      createdAt: new Date(),
      user: {
        email: user.email,
        name: getUserName(user.email),
      },
    });
  };

  // 💾 ADD / UPDATE
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Login required");
    if (!total) return alert("Enter values");

    try {
      if (editingEntry) {
        const diffPersonal =
          Number(form.personal) - editingEntry.personal;
        const diffOffice =
          Number(form.office) - editingEntry.office;
        const diffFarm =
          Number(form.farm) - editingEntry.farm;
        const diffTotal = total - editingEntry.total;

        await updateDoc(doc(db, "budget_entries", editingEntry.id), {
          personal: Number(form.personal),
          office: Number(form.office),
          farm: Number(form.farm),
          total,
          updatedAt: new Date(),
        });

        // 🔔 NOTIFICATION (EDIT)
        await notifyOthers({
          currentUser: user,
          type: "income",
          title: "Income Updated",
          message: `${user.email} updated income to Rs ${total} (${currentMonth})`,
        });

        const q = query(
          collection(db, "budgets"),
          where("month", "==", editingEntry.month)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const ref = snap.docs[0].ref;
          const existing = snap.docs[0].data();

          await updateDoc(ref, {
            personal: existing.personal + diffPersonal,
            office: existing.office + diffOffice,
            farm: existing.farm + diffFarm,
            total: existing.total + diffTotal,
          });
        }

        await addLog("edit", { ...editingEntry, total }, user);

        setEditingEntry(null);
        alert("Updated ✅");
      } else {
        const entry = {
          month: currentMonth,
          personal: Number(form.personal),
          office: Number(form.office),
          farm: Number(form.farm),
          total,
        };

        await addDoc(collection(db, "budget_entries"), {
          ...entry,
          createdAt: new Date(),
          createdBy: {
            email: user.email,
          },
        });

        // 🔔 NOTIFICATION (ADD)
        await notifyOthers({
          currentUser: user,
          type: "income",
          title: "Income Added",
          message: `${user.email} added Rs ${total} income (${currentMonth})`,
        });

        const q = query(
          collection(db, "budgets"),
          where("month", "==", currentMonth)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const ref = snap.docs[0].ref;
          const ex = snap.docs[0].data();

          await updateDoc(ref, {
            personal: ex.personal + entry.personal,
            office: ex.office + entry.office,
            farm: ex.farm + entry.farm,
            total: ex.total + entry.total,
          });
        } else {
          await addDoc(collection(db, "budgets"), {
            ...entry,
            createdAt: new Date(),
          });
        }

        await addLog("add", entry, user);
      }

      setForm({ personal: "", office: "", farm: "" });

    } catch (err) {
      console.error(err);
    }
  };

  // 🗑 DELETE
  const handleDelete = async (entry) => {
    if (!window.confirm("Delete?")) return;

    const user = auth.currentUser;

    await deleteDoc(doc(db, "budget_entries", entry.id));

    // 🔔 NOTIFICATION (DELETE)
    await notifyOthers({
      currentUser: user,
      type: "income",
      title: "Income Deleted",
      message: `${user.email} deleted Rs ${entry.total} income (${entry.month})`,
    });

    const q = query(
      collection(db, "budgets"),
      where("month", "==", entry.month)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const ref = snap.docs[0].ref;
      const ex = snap.docs[0].data();

      await updateDoc(ref, {
        personal: ex.personal - entry.personal,
        office: ex.office - entry.office,
        farm: ex.farm - entry.farm,
        total: ex.total - entry.total,
      });
    }

    await addLog("delete", entry, user);
  };

  const handleEdit = (e) => {
    setForm({
      personal: e.personal,
      office: e.office,
      farm: e.farm,
    });
    setEditingEntry(e);
  };

  return (
    <Layout>
      <Typography variant="h5" mb={3}>
        Income ({currentMonth})
      </Typography>

      {monthlyBudget && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Monthly Income Total</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Personal: {monthlyBudget.personal}</Typography>
            <Typography>Office: {monthlyBudget.office}</Typography>
            <Typography>Farm: {monthlyBudget.farm}</Typography>
            <Typography variant="h5">
              Total: PKR {monthlyBudget.total}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography>
            {editingEntry ? "Edit Income" : "Add Income"}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField fullWidth label="Personal" name="personal" type="number" value={form.personal} onChange={handleChange} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Office" name="office" type="number" value={form.office} onChange={handleChange} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Farm" name="farm" type="number" value={form.farm} onChange={handleChange} />
            </Grid>

            <Grid item xs={12}>
              <Typography>Total Income: PKR {total}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Button fullWidth variant="contained" onClick={handleSave}>
                {editingEntry ? "Update Income" : "Add Income"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {entries.map((e) => (
          <Grid item xs={12} md={4} key={e.id}>
            <Card>
              <CardContent>
                <Typography>📅 {e.month}</Typography>
                <Typography>👤 {getUserName(e.createdBy?.email)}</Typography>

                <Typography>Personal: {e.personal}</Typography>
                <Typography>Office: {e.office}</Typography>
                <Typography>Farm: {e.farm}</Typography>

                <Typography variant="h6">
                  PKR {e.total}
                </Typography>

                <Stack direction="row" spacing={1} mt={2}>
                  <Button size="small" onClick={() => handleEdit(e)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(e)}>Delete</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}