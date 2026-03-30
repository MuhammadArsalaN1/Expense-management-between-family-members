import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh" }}>
      <Sidebar />

      <Box
        sx={{
          flex: 1,
          ml: "240px", // 👈 IMPORTANT (no overlap)
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Topbar />

        <Box
          sx={{
            flex: 1,
            p: 3,
            bgcolor: "#F8F9FB",
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}