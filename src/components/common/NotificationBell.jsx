import { useEffect, useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

import { db } from "../../firebase/config";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("isRead", "==", false),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);
    });

    return () => unsub();
  }, [user]);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const formatTime = (timestamp) => {
    if (!timestamp?.seconds) return "";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ sx: { width: 300 } }}
      >
        <Box p={2}>
          <Typography fontWeight="bold">Notifications</Typography>
        </Box>

        <Divider />

        {notifications.slice(0, 4).map((item) => (
          <Box
            key={item.id}
            sx={{ p: 2, borderBottom: "1px solid #eee", cursor: "pointer" }}
            onClick={() => {
              handleClose();
              navigate("/notifications");
            }}
          >
            <Typography fontWeight="bold">{item.title}</Typography>
            <Typography fontSize={13}>{item.message}</Typography>
            <Typography fontSize={11} color="gray">
              {formatTime(item.createdAt)}
            </Typography>
          </Box>
        ))}

        {notifications.length === 0 && (
          <Box p={2}>
            <Typography>No new notifications</Typography>
          </Box>
        )}

        <Divider />

        <Box
          p={2}
          textAlign="center"
          sx={{ cursor: "pointer" }}
          onClick={() => {
            handleClose();
            navigate("/notifications");
          }}
        >
          <Typography color="primary">View All</Typography>
        </Box>
      </Menu>
    </>
  );
}