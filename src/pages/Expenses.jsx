import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import ExpenseForm from "../components/forms/ExpenseForm";

import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/config";

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Box,
  Chip,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [advances, setAdvances] = useState([]);

  const [filters, setFilters] = useState({
    category: "",
    user: "",
  });

  // 🔥 REAL-TIME EXPENSES
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "expenses"), (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // 🔥 REAL-TIME ADVANCES (NEW)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "advances"), (snap) => {
      setAdvances(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // 👤 USER NAME
  const getUserName = (value) => {
    if (!value) return "Unknown";

    const email =
      typeof value === "string" ? value : value?.email;

    if (!email) return "Unknown";

    if (email.includes("arsalan")) return "Arsalan";
    if (email.includes("rehan")) return "Rehan";

    return email;
  };

  // 🎨 CATEGORY COLORS
  const getCategoryColor = (category) => {
    if (category === "Advance") return "warning";
    if (category === "personal") return "primary";
    if (category === "office") return "secondary";
    if (category === "farm") return "success";
    return "default";
  };

  // 🔍 FILTER
  const filteredExpenses = expenses.filter((e) => {
    if (filters.category && e.category !== filters.category) return false;

    if (filters.user) {
      const userName = getUserName(e.createdBy);
      if (userName !== filters.user) return false;
    }

    return true;
  });

  // 🔥 SORT
  const sorted = [...filteredExpenses].sort(
    (a, b) =>
      new Date(b.createdAt?.seconds * 1000 || b.date) -
      new Date(a.createdAt?.seconds * 1000 || a.date)
  );

  // 📅 GROUP BY MONTH
  const grouped = sorted.reduce((acc, e) => {
    const date = e.createdAt
      ? new Date(e.createdAt.seconds * 1000)
      : new Date(e.date);

    const key = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    if (!acc[key]) acc[key] = [];
    acc[key].push(e);

    return acc;
  }, {});

  // ❌ DELETE
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "expenses", id));
  };

  // 🔥 ADVANCE BALANCE CALCULATION
  let arsalanToRehan = 0;
  let rehanToArsalan = 0;

  advances.forEach((a) => {
    if (a.status !== "approved") return;

    if (a.from.includes("arsalan")) {
      arsalanToRehan += a.amount;
    } else {
      rehanToArsalan += a.amount;
    }
  });

  const netBalance = arsalanToRehan - rehanToArsalan;

  return (
    <Layout>
      <Grid container spacing={3}>

        {/* MAIN */}
        <Grid size={{ xs: 12, md: 8 }}>

          {/* FORM */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <ExpenseForm />
            </CardContent>
          </Card>

          {/* 🔥 BALANCE CARD */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">💰 Advance Balance</Typography>

              <Typography mt={1}>
                Arsalan → Rehan: PKR {arsalanToRehan}
              </Typography>

              <Typography>
                Rehan → Arsalan: PKR {rehanToArsalan}
              </Typography>

              <Typography
                mt={1}
                fontWeight={700}
                color={netBalance > 0 ? "error" : "green"}
              >
                Net:{" "}
                {netBalance > 0
                  ? `Rehan owes Arsalan PKR ${netBalance}`
                  : netBalance < 0
                  ? `Arsalan owes Rehan PKR ${Math.abs(netBalance)}`
                  : "Settled"}
              </Typography>
            </CardContent>
          </Card>

          {/* FILTERS */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" mb={2}>
                🔍 Filters
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Category"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="personal">Personal</MenuItem>
                    <MenuItem value="office">Office</MenuItem>
                    <MenuItem value="farm">Farm</MenuItem>
                    <MenuItem value="Advance">Advance</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Created By"
                    value={filters.user}
                    onChange={(e) =>
                      setFilters({ ...filters, user: e.target.value })
                    }
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Arsalan">Arsalan</MenuItem>
                    <MenuItem value="Rehan">Rehan</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() =>
                      setFilters({ category: "", user: "" })
                    }
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* LIST */}
          <Card>
            <CardContent>
              <Typography variant="h6">All Expenses</Typography>

              <Divider sx={{ my: 2 }} />

              {Object.keys(grouped).map((month) => (
                <Box key={month} mb={3}>
                  <Typography variant="subtitle2">
                    📅 {month}
                  </Typography>

                  {grouped[month].map((e) => {
                    const isAdvance = e.category === "Advance";

                    return (
                      <Box
                        key={e.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: "14px",
                          border: "1px solid #E5E7EB",
                          background: isAdvance ? "#FFF7ED" : "#fff",
                        }}
                      >
                        <Box display="flex" justifyContent="space-between">
                          <Typography fontWeight={600}>
                            {e.subcategory || "General"}
                          </Typography>

                          <Typography fontWeight={700}>
                            PKR {e.total}
                          </Typography>
                        </Box>

                        <Typography variant="body2">
                          👤 {getUserName(e.createdBy)}
                        </Typography>

                        {isAdvance && (
                          <Typography color="warning.main">
                            ⚡ Advance Entry
                          </Typography>
                        )}

                        <Box mt={1}>
                          <Chip
                            label={e.category}
                            size="small"
                            color={getCategoryColor(e.category)}
                          />
                        </Box>

                        <Box mt={2} textAlign="right">
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(e.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* SIDE */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography fontWeight={600}>
                💡 Insights
              </Typography>

              <Typography variant="body2" mt={1}>
                Track your expenses, advances, and balance in real time.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}