import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Pagination,
  Stack,
} from "@mui/material";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";

const ITEMS_PER_PAGE = 15;

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);

  const auth = getAuth();
  const user = auth.currentUser;

  // 🔥 Format Date (NO date-fns)
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "No Date";

    let date;

    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🔥 Fetch Notifications (Realtime)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
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

  // 📄 Pagination
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedData = notifications.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);

  // ✅ Mark Read
  const markAsRead = async (id) => {
    await updateDoc(doc(db, "notifications", id), {
      isRead: true,
    });
  };

  // 🔁 Mark Unread
  const markAsUnread = async (id) => {
    await updateDoc(doc(db, "notifications", id), {
      isRead: false,
    });
  };

  // 🎨 Type Color
  const getColor = (type) => {
    switch (type) {
      case "income":
        return "success";
      case "expense":
        return "error";
      case "transfer":
        return "info";
      case "advance":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Layout>
      <Card sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h5" mb={2}>
            🔔 Notifications
          </Typography>

          {/* Empty State */}
          {notifications.length === 0 && (
            <Typography>No notifications found</Typography>
          )}

          {/* Notification List */}
          {paginatedData.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                background: item.isRead ? "#f5f5f5" : "#e3f2fd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "0.2s",
                "&:hover": {
                  transform: "scale(1.01)",
                },
              }}
            >
              {/* LEFT */}
              <Box>
                <Typography fontWeight="bold">
                  {item.title}
                </Typography>

                <Typography variant="body2">
                  {item.message}
                </Typography>

                <Typography variant="caption" color="gray">
                  {formatDateTime(item.createdAt)}
                </Typography>

                <Box mt={1}>
                  <Chip
                    label={item.type}
                    color={getColor(item.type)}
                    size="small"
                  />
                </Box>
              </Box>

              {/* RIGHT */}
              <Box>
                {item.isRead ? (
                  <Button
                    size="small"
                    onClick={() => markAsUnread(item.id)}
                  >
                    Mark Unread
                  </Button>
                ) : (
                  <Button
                    size="small"
                    onClick={() => markAsRead(item.id)}
                  >
                    Mark Read
                  </Button>
                )}
              </Box>
            </Box>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Stack alignItems="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}