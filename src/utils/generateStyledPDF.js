import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generateStyledPDF = async (receiptId) => {
  const element = document.getElementById(`receipt-${receiptId}`);

  if (!element) {
    console.error("Receipt element not found");
    return;
  }

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [360, canvas.height],
  });

  pdf.addImage(imgData, "PNG", 0, 0);
  pdf.save(`receipt-${receiptId}.pdf`);
};