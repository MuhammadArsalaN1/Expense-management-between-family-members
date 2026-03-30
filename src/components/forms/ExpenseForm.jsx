import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";
import dayjs from "dayjs";
import { addData } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";

// 🔔 NOTIFICATION SERVICE
import { notifyOthers } from "../../utils/notificationService";

// ✅ FIREBASE
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/config";

// ✅ PDF
import jsPDF from "jspdf";

const subCategories = {
  personal: ["Food", "Transport", "Bills", "Health", "Shopping", "Rent", "Entertainment", "Misc"],
  office: ["Salaries", "Software", "Hosting", "Domain", "Internet", "Equipment", "Marketing", "Client", "Misc"],
  farm: ["Feed", "Medicine", "Labor", "Maintenance", "Misc"],
};

export default function ExpenseForm() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    amount: "",
    tax: "",
    category: "",
    subcategory: "",
    paidBy: "",
    paymentMethod: "",
    notes: "",
    date: dayjs().format("YYYY-MM-DD"),
    recurring: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (name === "category") {
      setForm({ ...form, category: value, subcategory: "" });
      return;
    }

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🔥 Receipt Number
  const generateReceiptNumber = async () => {
    const q = query(
      collection(db, "receipts"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) return 1;

    const last = snapshot.docs[0].data();
    return (last.receiptNumber || 0) + 1;
  };

  // 🔥 PDF Generator
  const generatePDF = (receipt) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Expense Receipt", 20, 20);

    doc.setFontSize(12);
    doc.text(`Receipt #: ${receipt.receiptNumber}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);

    doc.text(`Category: ${receipt.category}`, 20, 70);
    doc.text(`Subcategory: ${receipt.subcategory || "-"}`, 20, 80);
    doc.text(`Paid By: ${receipt.paidBy}`, 20, 90);
    doc.text(`Payment Method: ${receipt.paymentMethod}`, 20, 100);

    doc.text(`Amount: Rs ${receipt.amount}`, 20, 120);
    doc.text(`Tax: Rs ${receipt.tax || 0}`, 20, 130);
    doc.text(`Total: Rs ${receipt.total}`, 20, 140);

    doc.text(`Notes: ${receipt.notes || "-"}`, 20, 160);

    doc.save(`receipt-${receipt.receiptNumber}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || !form.category) {
      alert("Please fill required fields");
      return;
    }

    if (!user) {
      alert("User not logged in");
      return;
    }

    const total =
      Number(form.amount || 0) + Number(form.tax || 0);

    const expenseData = {
      ...form,
      total,
      createdBy: user.email,
      createdAt: serverTimestamp(),
    };

    try {
      // ✅ Save Expense
      await addData("expenses", expenseData);

      // 🔔 SEND NOTIFICATION TO OTHERS
      await notifyOthers({
        currentUser: user,
        type: "expense",
        title: "Expense Added",
        message: `${user.email} added Rs ${form.amount} in ${form.category} (${form.subcategory || "General"}) via ${form.paymentMethod} (${form.notes || "No reason"})`,
        extra: {
          amount: form.amount,
          category: form.category,
          subcategory: form.subcategory,
          paymentMethod: form.paymentMethod,
          reason: form.notes,
          paidBy: form.paidBy,
        },
      });

      // ✅ Generate Receipt Number
      const receiptNumber = await generateReceiptNumber();

      const receiptData = {
        ...expenseData,
        receiptNumber,
        entryDate: new Date(),
        pdfGeneratedAt: new Date(),
        type: "expense",
      };

      // ✅ Save Receipt
      await addDoc(collection(db, "receipts"), receiptData);

      // ✅ Generate PDF
      generatePDF({
        ...receiptData,
        receiptNumber,
      });

      alert(`Receipt Generated ✅ #${receiptNumber}`);

      // 🔄 Reset Form
      setForm({
        amount: "",
        tax: "",
        category: "",
        subcategory: "",
        paidBy: "",
        paymentMethod: "",
        notes: "",
        date: dayjs().format("YYYY-MM-DD"),
        recurring: false,
      });

    } catch (error) {
      console.error(error);
      alert("Something went wrong ❌");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" mb={2}>
        Add Expense
      </Typography>

      <Grid container spacing={2}>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Amount"
            name="amount"
            value={form.amount}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Tax / Charges"
            name="tax"
            value={form.tax}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <MenuItem value="personal">Personal</MenuItem>
            <MenuItem value="office">IT Office</MenuItem>
            <MenuItem value="farm">Cattle Farm</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Sub Category"
            name="subcategory"
            value={form.subcategory}
            onChange={handleChange}
            disabled={!form.category}
          >
            {form.category &&
              subCategories[form.category].map((sub) => (
                <MenuItem key={sub} value={sub}>
                  {sub}
                </MenuItem>
              ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Paid By"
            name="paidBy"
            value={form.paidBy}
            onChange={handleChange}
          >
            <MenuItem value="arsalan">Arsalan</MenuItem>
            <MenuItem value="rehan">Rehan</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Payment Method"
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="bank">Bank</MenuItem>
            <MenuItem value="easypaisa">Easypaisa</MenuItem>
            <MenuItem value="jazzcash">JazzCash</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Reason / Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={form.recurring}
                onChange={handleChange}
                name="recurring"
              />
            }
            label="Recurring Expense"
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" type="submit" fullWidth>
            Add Expense + Generate Receipt
          </Button>
        </Grid>

      </Grid>
    </Box>
  );
}