import { Box, Typography, Divider } from "@mui/material";
import Barcode from "react-barcode";

export default function ReceiptTemplate({ receipt }) {
  const isArsalan =
    receipt.createdBy?.toLowerCase().includes("arsalan");

  const name = isArsalan ? "Arsalan A." : "Rehan M.";

  return (
    <Box
      id={`receipt-${receipt.id}`}
      sx={{
        width: 360,
        p: 3,
        background: "#fff",
        color: "#000",
        fontFamily: "monospace",
        border: "2px solid #1a50a0",
      }}
    >
      {/* 🔥 HEADER */}
      <Typography
        variant="h5"
        fontWeight="bold"
        textAlign="center"
        color="#1a50a0"
      >
        IT CORP INC
      </Typography>

      <Typography textAlign="center" fontSize={12}>
        TA-7 Nazimabad No 4, Karachi 74600
      </Typography>

      <Typography textAlign="center" fontSize={11} mt={1}>
        Digital Expense Receipt
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* INFO */}
      <Typography>Receipt #: {receipt.receiptNumber}</Typography>
      <Typography>
        Date:{" "}
        {receipt.createdAt?.toDate
          ? receipt.createdAt.toDate().toLocaleDateString()
          : new Date().toLocaleDateString()}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* DETAILS */}
      <Typography>Category: {receipt.category}</Typography>
      <Typography>Sub: {receipt.subcategory || "-"}</Typography>
      <Typography>Paid By: {receipt.paidBy}</Typography>
      <Typography>Method: {receipt.paymentMethod}</Typography>

      <Divider sx={{ my: 2 }} />

      {/* AMOUNT */}
      <Typography>Amount: Rs {receipt.amount}</Typography>
      <Typography>Tax: Rs {receipt.tax || 0}</Typography>
      <Typography fontWeight="bold">
        Total: Rs {receipt.total}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* 🔥 BARCODE */}
      <Box textAlign="center">
        <Barcode value={receipt.receiptNumber} height={40} />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 🔥 SIGNATURE */}
      <Box textAlign="right">
        <Typography fontSize={12}>Authorized By</Typography>

        <Typography
          sx={{
            fontFamily: "cursive",
            fontSize: 18,
          }}
        >
          {name}
        </Typography>

        <Typography fontSize={10}>
          {receipt.createdBy}
        </Typography>
      </Box>
    </Box>
  );
}