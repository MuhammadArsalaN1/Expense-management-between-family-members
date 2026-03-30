import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";

import {
  collection,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import dayjs from "dayjs";

export default function Dashboard() {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [profile, setProfile] = useState(null);
  const [advances, setAdvances] = useState([]);

  const currentMonth = dayjs().format("YYYY-MM");

  // PROFILE
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((docSnap) => {
      if (docSnap.exists()) setProfile(docSnap.data());
    });
  }, [user]);

  // EXPENSES
  useEffect(() => {
    return onSnapshot(collection(db, "expenses"), (snap) => {
      setExpenses(snap.docs.map((d) => d.data()));
    });
  }, []);

  // ADVANCES 🔥
  useEffect(() => {
    return onSnapshot(collection(db, "advances"), (snap) => {
      setAdvances(snap.docs.map((d) => d.data()));
    });
  }, []);

  // BUDGET
  useEffect(() => {
    return onSnapshot(collection(db, "budgets"), (snap) => {
      const budgets = snap.docs.map((d) => d.data());
      const current = budgets.find((b) => b.month === currentMonth);
      setMonthlyBudget(current || null);
    });
  }, [currentMonth]);

  // 🔥 CUSTOM CYCLE
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 2);

  const filteredExpenses = expenses.filter((e) => {
    const date = e.createdAt
      ? new Date(e.createdAt.seconds * 1000)
      : new Date();
    return date >= start && date <= end;
  });

  // 💰 CALCULATIONS
  const totalExpenses = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.total || 0),
    0
  );

  const totalIncome = Number(monthlyBudget?.total || 0);
  const balance = totalIncome - totalExpenses;

  // 📊 CATEGORY
  const categoryTotals = {};
  filteredExpenses.forEach((e) => {
    const cat = e.category || "Other";
    categoryTotals[cat] =
      (categoryTotals[cat] || 0) + Number(e.total || 0);
  });

  const pieData = Object.entries(categoryTotals).map(
    ([name, value]) => ({ name, value })
  );

  // 👤 USERS
  let arsalanTotal = 0;
  let rehanTotal = 0;

  filteredExpenses.forEach((e) => {
    const email =
      typeof e.createdBy === "string"
        ? e.createdBy
        : e.createdBy?.email;

    if (!email) return;

    if (email.includes("arsalan")) arsalanTotal += Number(e.total || 0);
    else if (email.includes("rehan")) rehanTotal += Number(e.total || 0);
  });

  // 📈 TREND (NOT FILTERED)
  const monthlyTotals = {};
  expenses.forEach((e) => {
    const date = e.createdAt
      ? new Date(e.createdAt.seconds * 1000)
      : new Date();

    const key = `${date.getFullYear()}-${date.getMonth()}`;

    monthlyTotals[key] =
      (monthlyTotals[key] || 0) + Number(e.total || 0);
  });

  const barData = Object.entries(monthlyTotals)
    .map(([key, total]) => {
      const [year, month] = key.split("-");
      return {
        month: `${Number(month) + 1}/${year}`,
        total,
      };
    })
    .sort((a, b) => {
      const [m1, y1] = a.month.split("/");
      const [m2, y2] = b.month.split("/");
      return new Date(y1, m1 - 1) - new Date(y2, m2 - 1);
    })
    .slice(-6);

  // 🔥 ADVANCE LOGIC
  const sent = advances.filter((a) => a.from === user?.email);
  const received = advances.filter((a) => a.to === user?.email);

  const count = (list, status) =>
    list.filter((a) => a.status === status).length;

  const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444"];

  return (
    <Layout>
      <Typography variant="h5" mb={1}>
        Welcome, {profile?.fullName || user?.email}
      </Typography>

      <Typography variant="caption">
        Cycle: {start.toLocaleDateString()} → {end.toLocaleDateString()}
      </Typography>

      {/* KPI */}
      <Grid container spacing={3} mt={1}>
        {[{
          title: "Income",
          value: totalIncome,
          color: "#22C55E"
        },{
          title: "Expenses",
          value: totalExpenses,
          color: "#EF4444"
        },{
          title: "Balance",
          value: balance,
          color: "#6366F1"
        }].map((card) => (
          <Grid size={{ xs: 12, md: 4 }} key={card.title}>
            <Card sx={{
              borderRadius: "16px",
              background: `linear-gradient(135deg, ${card.color}20, #fff)`
            }}>
              <CardContent>
                <Typography>{card.title}</Typography>
                <Typography variant="h4" fontWeight={700}>
                  PKR {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 🔥 ADVANCE SUMMARY */}
      <Typography mt={4} mb={2} variant="h6">
        💸 Advance Summary
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography>📤 Sent</Typography>
            <Typography>Pending: {count(sent,"pending")}</Typography>
            <Typography>Approved: {count(sent,"approved")}</Typography>
            <Typography>Rejected: {count(sent,"rejected")}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography>📥 Received</Typography>
            <Typography>Pending: {count(received,"pending")}</Typography>
            <Typography>Approved: {count(received,"approved")}</Typography>
            <Typography>Rejected: {count(received,"rejected")}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* PIE + USER */}
      <Grid container spacing={3} mt={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card><CardContent sx={{ height: 250 }}>
            <Typography>📊 Category</Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={80}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography>👤 Users</Typography>
            <Typography>Arsalan: PKR {arsalanTotal}</Typography>
            <Typography>Rehan: PKR {rehanTotal}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* BAR */}
      <Typography mt={4} mb={2} variant="h6">
        📈 Quarterly Trend
      </Typography>

      <Card><CardContent sx={{ height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v)=>[`PKR ${v}`]} />
            <Bar dataKey="total" radius={[12,12,0,0]} barSize={40}>
              {barData.map((_, i) => (
                <Cell key={i} fill={i===barData.length-1 ? "#6366F1" : "#A5B4FC"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent></Card>

    </Layout>
  );
}