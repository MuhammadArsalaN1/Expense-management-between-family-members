import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { db, auth } from "../firebase/config";

// 🔔 NOTIFICATION (ADDED)
import { notifyOthers } from "../utils/notificationService";

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Stack,
  Box,
  MenuItem,
} from "@mui/material";

// 👤 USER MAP
const getUserName = (email) => {
  const map = {
    "arsalanch336@gmail.com": "Arsalan",
    "mohomadrehan12@gmail.com": "Rehan",
  };
  return map[email] || email;
};

export default function Advances() {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "advances"), (snap) => {
      setList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // ➕ ADD REQUEST
  const handleAdd = async () => {
    if (!amount || !selectedUser || !reason) {
      return alert("Enter amount, select user & add reason");
    }

    await addDoc(collection(db, "advances"), {
      amount: Number(amount),
      reason,
      from: user.email,
      to: selectedUser,
      status: "pending",
      createdAt: new Date(),
    });

    // 🔔 NOTIFICATION (ADD)
    await notifyOthers({
      currentUser: user,
      type: "advance",
      title: "Advance Request",
      message: `${user.email} requested Rs ${amount} (${reason})`,
    });

    setAmount("");
    setReason("");
    setSelectedUser("");
  };

  // ✏️ UPDATE
  const handleUpdate = async () => {
    if (!editing) return;

    await updateDoc(doc(db, "advances", editing.id), {
      amount: Number(amount),
      reason,
      updatedAt: new Date(),
    });

    // 🔔 NOTIFICATION (UPDATE)
    await notifyOthers({
      currentUser: user,
      type: "advance",
      title: "Advance Updated",
      message: `${user.email} updated advance to Rs ${amount} (${reason})`,
    });

    setEditing(null);
    setAmount("");
    setReason("");
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete request?")) return;

    await deleteDoc(doc(db, "advances", id));

    // 🔔 NOTIFICATION (DELETE)
    await notifyOthers({
      currentUser: user,
      type: "advance",
      title: "Advance Deleted",
      message: `${user.email} deleted an advance request`,
    });
  };

  // ✅ APPROVE
  const handleApprove = async (a) => {
    if (a.status === "approved") return;

    await updateDoc(doc(db, "advances", a.id), {
      status: "approved",
    });

    // 🔔 NOTIFICATION (APPROVE)
    await notifyOthers({
      currentUser: user,
      type: "advance",
      title: "Advance Approved",
      message: `${user.email} approved Rs ${a.amount} for ${getUserName(a.from)}`,
    });

    await addDoc(collection(db, "expenses"), {
      amount: a.amount,
      total: a.amount,
      category: "Advance",
      subcategory: "Approved Advance",
      note: `Advance approved for ${getUserName(a.from)} | Reason: ${a.reason}`,
      createdAt: new Date(),
      createdBy: { email: a.from },
    });
  };

  // ❌ REJECT
  const handleReject = async (id) => {
    await updateDoc(doc(db, "advances", id), {
      status: "rejected",
    });

    // 🔔 NOTIFICATION (REJECT)
    await notifyOthers({
      currentUser: user,
      type: "advance",
      title: "Advance Rejected",
      message: `${user.email} rejected an advance request`,
    });
  };

  return (
    <Layout>
      <Grid container spacing={3}>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {editing ? "Edit Request" : "Request Advance"}
              </Typography>

              {!editing && (
                <TextField
                  select
                  fullWidth
                  label="Request To"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  sx={{ mt: 2 }}
                >
                  <MenuItem value="arsalanch336@gmail.com">
                    Arsalan
                  </MenuItem>
                  <MenuItem value="mohomadrehan12@gmail.com">
                    Rehan
                  </MenuItem>
                </TextField>
              )}

              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                sx={{ mt: 2 }}
              />

              <TextField
                fullWidth
                label="Reason"
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                sx={{ mt: 2 }}
              />

              <Button
                fullWidth
                sx={{ mt: 2 }}
                variant="contained"
                onClick={editing ? handleUpdate : handleAdd}
              >
                {editing ? "Update" : "Request"}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Advance Requests</Typography>

              {list.map((a) => {
                const isRequester = a.from === user?.email;
                const isReceiver = a.to === user?.email;

                return (
                  <Box key={a.id} sx={{ p: 2, mb: 2, borderRadius: "12px", border: "1px solid #E5E7EB" }}>
                    <Typography fontWeight={600}>
                      {getUserName(a.from)} → {getUserName(a.to)}
                    </Typography>

                    <Typography>PKR {a.amount}</Typography>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Reason:</strong> {a.reason}
                    </Typography>

                    <Typography
                      variant="caption"
                      color={
                        a.status === "approved"
                          ? "green"
                          : a.status === "rejected"
                          ? "error"
                          : "orange"
                      }
                    >
                      {a.status.toUpperCase()}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={2}>
                      {isRequester && a.status === "pending" && (
                        <>
                          <Button size="small" onClick={() => {
                            setEditing(a);
                            setAmount(a.amount);
                            setReason(a.reason);
                          }}>
                            Edit
                          </Button>

                          <Button size="small" color="error" onClick={() => handleDelete(a.id)}>
                            Delete
                          </Button>
                        </>
                      )}

                      {isReceiver && a.status === "pending" && (
                        <>
                          <Button size="small" color="success" onClick={() => handleApprove(a)}>
                            Approve
                          </Button>

                          <Button size="small" color="error" onClick={() => handleReject(a.id)}>
                            Reject
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}