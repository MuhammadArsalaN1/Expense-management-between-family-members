import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: {
      default: "#F8F9FB",
    },
    primary: {
      main: "#111827",
    },
    success: {
      main: "#10B981",
    },
    error: {
      main: "#EF4444",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
});

export default theme; // ✅ THIS LINE IS REQUIRED