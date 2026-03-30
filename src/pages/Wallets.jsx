import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebase/config";

const walletThemes = {
  payoneer: {
    title: "Payoneer",
    gradient: "linear-gradient(135deg, #ff4800, #ff9a3c)",
    currency: "$",
    code: "USD",
  },
  jazzcash: {
    title: "JazzCash",
    gradient: "linear-gradient(135deg, #a1003c, #ff4b7d)",
    currency: "Rs",
    code: "PKR",
  },
  paypal: {
    title: "PayPal",
    gradient: "linear-gradient(135deg, #003087, #009cde)",
    currency: "£",
    code: "GBP",
  },
};

const initialUsers = {
  payoneer: ["Arsalan", "Mustijab", "Anjum", "Boota"],
  jazzcash: ["Arsalan", "Rehan", "Anjum", "Boota"],
  paypal: ["Rehan", "Hybrid Solution"],
};

export default function Wallets() {
  const [wallets, setWallets] = useState({});
  const [amounts, setAmounts] = useState({});
  const [transactions, setTransactions] = useState([]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  // 🔥 DATE FILTER
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // 🔄 WALLET SYNC
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "wallets"), (snapshot) => {
      const data = {};
      snapshot.forEach((docSnap) => {
        const w = docSnap.data();
        if (!data[w.type]) data[w.type] = [];
        data[w.type].push({
          id: docSnap.id,
          name: w.name,
          balance: w.balance,
        });
      });
      setWallets(data);
    });
    return () => unsub();
  }, []);

  // 🔄 TRANSACTIONS
  useEffect(() => {
    const q = query(
      collection(db, "transactions"),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(data);
    });

    return () => unsub();
  }, []);

  // 🧠 INIT
  useEffect(() => {
    const setupWallets = async () => {
      for (const type of Object.keys(initialUsers)) {
        for (const name of initialUsers[type]) {
          const id = `${type}_${name}`;
          await setDoc(
            doc(db, "wallets", id),
            {
              name,
              type,
              balance: 0,
              currency: walletThemes[type].code,
            },
            { merge: true }
          );
        }
      }

      try {
        await deleteDoc(doc(db, "wallets", "jazzcash_Mustijab"));
      } catch {}
    };

    setupWallets();
  }, []);

  const handleChange = (key, value) => {
    setAmounts({ ...amounts, [key]: value });
  };

  const openModal = (wallet, type, action, key) => {
    setSelected({ wallet, type, action, key });
    setOpen(true);
  };

  const handleConfirm = async () => {
    const { wallet, type, action, key } = selected;
    const amount = parseFloat(amounts[key]) || 0;

    if (!amount || !reason) {
      alert("Enter amount & reason");
      return;
    }

    const newBalance =
      action === "add"
        ? wallet.balance + amount
        : wallet.balance - amount;

    if (newBalance < 0) {
      alert("Insufficient balance");
      return;
    }

    await updateDoc(doc(db, "wallets", wallet.id), {
      balance: newBalance,
    });

    await addDoc(collection(db, "transactions"), {
      walletId: wallet.id,
      name: wallet.name,
      type,
      action,
      amount,
      reason,
      currency: walletThemes[type].code,
      previousBalance: wallet.balance,
      newBalance,
      timestamp: serverTimestamp(),
    });

    setReason("");
    setOpen(false);
  };

  const formatCurrency = (value, type) => {
    const { currency, code } = walletThemes[type];
    return `${currency} ${Number(value || 0).toFixed(2)} ${code}`;
  };

  // 🕒 FORMAT DATE
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "—";
    return timestamp.toDate().toLocaleString("en-PK");
  };

  // 🎯 FILTER LOGIC
  const filteredTransactions = transactions.filter((t) => {
    if (!t.timestamp) return true;

    const date = t.timestamp.toDate();

    if (fromDate && new Date(fromDate) > date) return false;
    if (toDate && new Date(toDate + "T23:59:59") < date) return false;

    return true;
  });

  const paginatedData = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderWalletSection = (type) => (
    <Box mb={4}>
      <Typography variant="h5" mb={2} fontWeight="bold">
        {walletThemes[type].title}
      </Typography>

      <Grid container spacing={3}>
        {(wallets[type] || []).map((wallet, index) => {
          const key = `${type}-${index}`;

          return (
            <Grid item xs={12} md={4} key={wallet.id}>
              <Card
                sx={{
                  background: walletThemes[type].gradient,
                  color: "#fff",
                  borderRadius: "16px",
                }}
              >
                <CardContent>
                  <Typography variant="h6">{wallet.name}</Typography>

                  <Typography variant="h4" mt={1} mb={2}>
                    {formatCurrency(wallet.balance, type)}
                  </Typography>

                  <TextField
                    size="small"
                    fullWidth
                    placeholder={`Amount (${walletThemes[type].code})`}
                    value={amounts[key] || ""}
                    onChange={(e) =>
                      handleChange(key, e.target.value)
                    }
                    sx={{ background: "#fff", borderRadius: 2, mb: 1 }}
                  />

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        color="success"
                        variant="contained"
                        onClick={() =>
                          openModal(wallet, type, "add", key)
                        }
                      >
                        ADD
                      </Button>
                    </Grid>

                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        color="error"
                        variant="contained"
                        onClick={() =>
                          openModal(wallet, type, "withdraw", key)
                        }
                      >
                        WITHDRAW
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  return (
    <Layout>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Wallet Management
      </Typography>

      {renderWalletSection("payoneer")}
      {renderWalletSection("jazzcash")}
      {renderWalletSection("paypal")}

      {/* 🔍 FILTER */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          type="date"
          label="From"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <TextField
          type="date"
          label="To"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </Box>

      {/* 📊 TABLE */}
      <Typography variant="h5" mt={2} mb={2}>
        Transaction History
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Date & Time</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedData.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.name}</TableCell>
              <TableCell>{t.type}</TableCell>

              {/* 🎨 COLOR TAG */}
              <TableCell>
                <Chip
                  label={t.action}
                  color={t.action === "add" ? "success" : "error"}
                  size="small"
                />
              </TableCell>

              <TableCell>
                {t.amount} {t.currency}
              </TableCell>

              <TableCell>{t.reason}</TableCell>

              <TableCell>
                {formatDateTime(t.timestamp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 🔄 PAGINATION */}
      <Box mt={2} display="flex" gap={2}>
        <Button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </Button>
        <Button
          disabled={
            (page + 1) * rowsPerPage >= filteredTransactions.length
          }
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </Box>

      {/* 📝 MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Enter Reason</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Client Payment"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}