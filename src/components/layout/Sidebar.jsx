import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../firebase/auth";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const sections = [
    {
      title: "Core",
      items: [
        { name: "Dashboard", path: "/" },
        { name: "Monthly Budget", path: "/budget" },
      ],
    },
    {
      title: "Finance",
      items: [
        { name: "Expenses", path: "/expenses" },
        { name: "Recurring Expenses", path: "/recurring" },
        // ❌ Categories removed from here
      ],
    },
    {
      title: "Internal",
      items: [{ name: "Advances", path: "/advances" }],
    },
    {
      title: "Analytics",
      items: [
        { name: "Analytics Dashboard", path: "/analytics" },
        { name: "Insights", path: "/insights" },
      ],
    },
    {
      title: "Tracking",
      items: [
        { name: "Timeline", path: "/timeline" },
        { name: "Receipts", path: "/receipts" },
      ],
    },
    {
      title: "System",
      items: [
        { name: "Wallets", path: "/wallets" },
        { name: "Notifications", path: "/notifications" },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  // 🔓 LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        bgcolor: "#FFFFFF",
        borderRight: "1px solid #E5E7EB",
        p: 2,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <Typography variant="h6" mb={2}>
        Expense App
      </Typography>

      {/* Sections */}
      {sections.map((section) => (
        <Box key={section.title} mb={2}>
          <Typography
            variant="caption"
            sx={{ color: "#6B7280", px: 1 }}
          >
            {section.title}
          </Typography>

          <List>
            {section.items.map((item) => (
              <ListItemButton
                key={item.name}
                onClick={() => navigate(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: "10px",
                  mb: 0.5,
                  bgcolor: isActive(item.path)
                    ? "#F3F4F6"
                    : "transparent",
                }}
              >
                <ListItemText primary={item.name} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* Logout */}
      <ListItemButton
        onClick={handleLogout}
        sx={{ borderRadius: "10px" }}
      >
        <ListItemText primary="Logout" />
      </ListItemButton>
    </Box>
  );
}