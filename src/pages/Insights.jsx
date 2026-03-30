import Layout from "../components/layout/Layout";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Box,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { subscribeData } from "../firebase/firestore";

const gradient = "linear-gradient(135deg, #667eea, #764ba2)";

// 🧠 AI ENGINE (2-MONTH + SAFE)
const getMonthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}`;
};

const generateAI = (expenses) => {
  if (!expenses.length) return { status: "empty" };

  let categoryMap = {};
  let paidByMap = {};
  let monthMap = {};

  expenses.forEach((e) => {
    const amount = Number(e.amount || 0);

    // category
    const category = e.category || "Other";
    categoryMap[category] = (categoryMap[category] || 0) + amount;

    // paidBy
    const paidBy = e.paidBy || "Unknown";
    paidByMap[paidBy] = (paidByMap[paidBy] || 0) + amount;

    // months
    if (e.date) {
      const key = getMonthKey(e.date);
      if (!monthMap[key]) monthMap[key] = [];
      monthMap[key].push(e);
    }
  });

  const months = Object.keys(monthMap);

  // ❌ NOT ENOUGH DATA
  if (months.length < 2) {
    return {
      status: "insufficient",
      message: "AI needs at least 2 months of data",
    };
  }

  // 📊 MONTH COMPARISON
  const sorted = months.sort();
  const current = monthMap[sorted[sorted.length - 1]];
  const previous = monthMap[sorted[sorted.length - 2]];

  const sum = (arr) =>
    arr.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const currentTotal = sum(current);
  const previousTotal = sum(previous);

  // ✅ SAFE CHANGE
  let change = 0;
  if (previousTotal > 0) {
    change =
      ((currentTotal - previousTotal) / previousTotal) * 100;
  }

  // 💰 Budget (based on previous)
  const budget = Math.round(previousTotal * 1.1);

  // ⚖️ Split AI
  const users = Object.keys(paidByMap);
  let imbalance = 0;

  if (users.length === 2) {
    imbalance = Math.abs(
      paidByMap[users[0]] - paidByMap[users[1]]
    );
  }

  // 🧠 Score
  let score = 100;

  if (change > 20) score -= 20;
  if (change > 40) score -= 20;
  if (imbalance > currentTotal * 0.3) score -= 20;

  if (score < 0) score = 0;

  // ⚠️ Insights
  const insights = [
    `This month: Rs ${currentTotal}`,
    `Last month: Rs ${previousTotal}`,
    `Change: ${change.toFixed(1)}%`,
  ];

  // 🎯 Suggestions
  const suggestions = [];

  if (change > 20) {
    suggestions.push("Spending increased — reduce expenses");
  }

  if (currentTotal > budget) {
    suggestions.push(`Budget exceeded (Rs ${budget})`);
  }

  if (imbalance > currentTotal * 0.2) {
    suggestions.push("Balance spending between users");
  }

  if (!suggestions.length) {
    suggestions.push("Everything looks balanced 👍");
  }

  return {
    status: "ready",
    score,
    currentTotal,
    previousTotal,
    change,
    budget,
    categoryMap,
    paidByMap,
    insights,
    suggestions,
  };
};

export default function Insights() {
  const [ai, setAI] = useState(null);

  useEffect(() => {
    const unsub = subscribeData("expenses", (data) => {
      setAI(generateAI(data));
    });

    return () => unsub();
  }, []);

  const getScoreColor = (score) => {
    if (score > 75) return "#4caf50";
    if (score > 50) return "#ff9800";
    return "#f44336";
  };

  // 🧠 STATES
  if (!ai || ai.status === "empty") {
    return <Typography p={3}>No data available</Typography>;
  }

  if (ai.status === "insufficient") {
    return (
      <Typography p={3}>
        🧠 AI is learning...
        <br />
        {ai.message}
      </Typography>
    );
  }

  return (
    <Layout>
      <Grid container spacing={3}>

        {/* 🧠 SCORE */}
        <Grid item xs={12}>
          <Card sx={{ background: gradient, color: "#fff", borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6">🧠 Financial Health</Typography>
              <Typography variant="h3">{ai.score ?? 0}</Typography>

              <LinearProgress
                variant="determinate"
                value={ai.score ?? 0}
                sx={{
                  mt: 2,
                  height: 10,
                  borderRadius: 5,
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getScoreColor(ai.score ?? 0),
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 📈 TREND */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography>📈 Monthly Change</Typography>
              <Typography variant="h4">
                {(ai.change ?? 0).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 💰 BUDGET */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography>💰 Budget</Typography>
              <Typography variant="h5">
                Rs {ai.budget ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 📊 CATEGORY */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography>📊 Categories</Typography>
              {Object.entries(ai.categoryMap || {}).map(([k, v]) => (
                <Box key={k} mt={1}>
                  <Typography>{k} - Rs {v}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      ai.currentTotal
                        ? (v / ai.currentTotal) * 100
                        : 0
                    }
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* 👥 USERS */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography>👥 Contributions</Typography>
              {Object.entries(ai.paidByMap || {}).map(([k, v]) => (
                <Typography key={k}>
                  {k}: Rs {v}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* ⚠️ INSIGHTS */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography>⚠️ Insights</Typography>
              {ai.insights?.map((i, idx) => (
                <Typography key={idx}>• {i}</Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* 🎯 ACTIONS */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography>🎯 Actions</Typography>
              {ai.suggestions?.map((s, idx) => (
                <Chip key={idx} label={s} sx={{ m: 0.5 }} />
              ))}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Layout>
  );
}