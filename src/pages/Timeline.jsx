import { useEffect, useState, useMemo } from "react";
import Layout from "../components/layout/Layout";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebase/config";

export default function Timeline() {
  const [records, setRecords] = useState([]);

  const [scope, setScope] = useState("all");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");

  // 🔥 FETCH
  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        scope: doc.data().scope || "personal",
        type: doc.data().type || "expense",
      }));
      setRecords(data);
    });

    return () => unsub();
  }, []);

  // 🔥 FILTER
  const filtered = useMemo(() => {
    return records.filter((r) => {
      return (
        (scope === "all" || r.scope === scope) &&
        (type === "all" || r.type === type) &&
        (category === "all" || r.category === category)
      );
    });
  }, [records, scope, type, category]);

  // 🔥 KPI
  const kpi = useMemo(() => {
    let expense = 0;
    let earning = 0;

    filtered.forEach((r) => {
      const amt = Number(r.amount || 0);
      if (r.type === "expense") expense += amt;
      else earning += amt;
    });

    return {
      expense,
      earning,
      balance: earning - expense,
    };
  }, [filtered]);

  // 🔥 MONTHLY FLOW
  const monthlyFlow = useMemo(() => {
    const map = {};

    records.forEach((r) => {
      let d;

      if (r.createdAt?.toDate) d = r.createdAt.toDate();
      else if (r.date) d = new Date(r.date);
      else return;

      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;

      if (!map[key]) map[key] = { earning: 0, expense: 0 };

      const amt = Number(r.amount || 0);

      if (r.type === "expense") map[key].expense += amt;
      else map[key].earning += amt;
    });

    const sorted = Object.keys(map).sort((a, b) => {
      const [y1, m1] = a.split("-");
      const [y2, m2] = b.split("-");
      return new Date(y1, m1 - 1) - new Date(y2, m2 - 1);
    });

    let running = 0;

    return sorted.map((k) => {
      const net = map[k].earning - map[k].expense;
      running += net;

      return {
        month: k,
        ...map[k],
        net,
        balance: running,
      };
    });
  }, [records]);

  // 🔥 YEARLY SUMMARY
  const yearlySummary = useMemo(() => {
    const map = {};

    records.forEach((r) => {
      let d;

      if (r.createdAt?.toDate) d = r.createdAt.toDate();
      else if (r.date) d = new Date(r.date);
      else return;

      const year = d.getFullYear();

      if (!map[year]) {
        map[year] = { earning: 0, expense: 0 };
      }

      const amt = Number(r.amount || 0);

      if (r.type === "expense") map[year].expense += amt;
      else map[year].earning += amt;
    });

    return Object.keys(map).map((y) => ({
      year: y,
      earning: map[y].earning,
      expense: map[y].expense,
      balance: map[y].earning - map[y].expense,
    }));
  }, [records]);

  // 🔥 GROUP TIMELINE
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((r) => {
      if (!g[r.date]) g[r.date] = [];
      g[r.date].push(r);
    });
    return g;
  }, [filtered]);

  const categories = [...new Set(records.map((r) => r.category))];

  return (
    <Layout>
      <Box p={3}>

        {/* FILTERS */}
        <Grid container spacing={2} mb={3}>
          <Grid item>
            <ToggleButtonGroup value={scope} exclusive onChange={(e, v) => v && setScope(v)}>
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="personal">Personal</ToggleButton>
              <ToggleButton value="office">Office</ToggleButton>
              <ToggleButton value="farm">Farm</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item>
            <ToggleButtonGroup value={type} exclusive onChange={(e, v) => v && setType(v)}>
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="expense">Expense</ToggleButton>
              <ToggleButton value="earning">Earning</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item>
            <TextField select value={category} onChange={(e) => setCategory(e.target.value)} size="small">
              <MenuItem value="all">All</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* KPI */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={4}><Card><CardContent><Typography>Expense</Typography><Typography color="error">Rs {kpi.expense}</Typography></CardContent></Card></Grid>
          <Grid item xs={4}><Card><CardContent><Typography>Earnings</Typography><Typography color="success.main">Rs {kpi.earning}</Typography></CardContent></Card></Grid>
          <Grid item xs={4}><Card><CardContent><Typography>Balance</Typography><Typography>Rs {kpi.balance}</Typography></CardContent></Card></Grid>
        </Grid>

        {/* 🔥 MONTHLY TABLE */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">📅 Monthly Table</Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Earning</TableCell>
                  <TableCell>Expense</TableCell>
                  <TableCell>Net</TableCell>
                  <TableCell>Balance</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {monthlyFlow.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell>{m.month}</TableCell>
                    <TableCell style={{ color: "green" }}>Rs {m.earning}</TableCell>
                    <TableCell style={{ color: "red" }}>Rs {m.expense}</TableCell>
                    <TableCell>Rs {m.net}</TableCell>
                    <TableCell><b>Rs {m.balance}</b></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 🔥 YEARLY TABLE */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">📊 Yearly Summary</Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  <TableCell>Total Earning</TableCell>
                  <TableCell>Total Expense</TableCell>
                  <TableCell>Final Balance</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {yearlySummary.map((y, i) => (
                  <TableRow key={i}>
                    <TableCell>{y.year}</TableCell>
                    <TableCell style={{ color: "green" }}>Rs {y.earning}</TableCell>
                    <TableCell style={{ color: "red" }}>Rs {y.expense}</TableCell>
                    <TableCell><b>Rs {y.balance}</b></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* TIMELINE */}
        {Object.keys(grouped).map((date) => (
          <Accordion key={date}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{date}</Typography>
            </AccordionSummary>

            <AccordionDetails>
              {grouped[date].map((item) => (
                <Box key={item.id} mb={1}>
                  <Typography>
                    [{item.scope}] {item.category} → {item.subcategory}
                  </Typography>

                  <Typography>Rs {item.amount}</Typography>

                  {item.tags?.map((t, i) => (
                    <Chip key={i} label={t} size="small" sx={{ mr: 1 }} />
                  ))}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}

      </Box>
    </Layout>
  );
}