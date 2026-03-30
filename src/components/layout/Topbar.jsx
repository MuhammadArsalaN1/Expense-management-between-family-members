import { Box, Typography } from "@mui/material";
import NotificationBell from "../common/NotificationBell"; // ✅ make sure file exists

export default function Topbar() {
  return (
    <Box
      height={60}
      bgcolor="#FFFFFF"
      borderBottom="1px solid #E5E7EB"
      display="flex"
      alignItems="center"
      justifyContent="space-between" // ✅ pushes bell to right
      px={3}
    >
      {/* LEFT SIDE */}
      <Typography variant="h6">Dashboard</Typography>

      {/* RIGHT SIDE */}
      <Box display="flex" alignItems="center" gap={2}>
        <NotificationBell />
      </Box>
    </Box>
  );
}