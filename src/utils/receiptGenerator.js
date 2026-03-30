import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";

export const generateReceiptPDF = async (receipt) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const blue = [25, 80, 160];
  const invoiceNumber = receipt.receiptNumber;

  // HEADER
  doc.setFontSize(18);
  doc.setTextColor(...blue);
  doc.text("IT CORP INC", 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("TA-7 Nazimabad No 4, Karachi 74600", 20, 26);

  doc.setFontSize(16);
  doc.setTextColor(...blue);
  doc.text("RECEIPT", pageWidth - 20, 20, { align: "right" });

  doc.setDrawColor(...blue);
  doc.line(20, 35, pageWidth - 20, 35);

  // INFO
  doc.setFontSize(10);
  doc.setTextColor(0);

  doc.text(`Invoice #: ${invoiceNumber}`, 20, 45);
  doc.text(
    `Date: ${new Date().toLocaleDateString()}`,
    pageWidth - 20,
    45,
    { align: "right" }
  );

  // DETAILS
  doc.text(`Category: ${receipt.category}`, 20, 60);
  doc.text(`Paid By: ${receipt.paidBy}`, 20, 70);

  // BARCODE
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, invoiceNumber);

  const img = canvas.toDataURL("image/png");
  doc.addImage(img, "PNG", 40, 90, 120, 40);

  // TOTAL
  doc.text(`Total: Rs ${receipt.total}`, 20, 150);

  doc.save(`receipt-${invoiceNumber}.pdf`);
};