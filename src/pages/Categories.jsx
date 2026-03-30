import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { db, auth } from "../firebase/config";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Stack,
  Chip,
} from "@mui/material";


// 👤 USER MAP
const getUserName = (email) => {
  const map = {
    "arsalanch336@gmail.com": "Arsalan",
    "mohomadrehan12@gmail.com": "Rehan",
  };
  return map[email] || email || "Unknown";
};

export default function Categories() {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [editingId, setEditingId] = useState(null);

  // 🔥 REAL-TIME LISTENER
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // ➕ ADD CATEGORY
  const handleAdd = async () => {
    if (!category) return alert("Enter category");

    const user = auth.currentUser;

    await addDoc(collection(db, "categories"), {
      name: category,
      subcategories: subcategory ? [subcategory] : [],
      createdAt: new Date(),
      createdBy: {
        email: user?.email,
      },
    });

    setCategory("");
    setSubcategory("");
  };

  // ✏️ ADD SUBCATEGORY
  const handleAddSub = async (cat) => {
    if (!subcategory) return alert("Enter subcategory");

    const ref = doc(db, "categories", cat.id);

    await updateDoc(ref, {
      subcategories: [...(cat.subcategories || []), subcategory],
    });

    setSubcategory("");
  };

  // 🗑 DELETE CATEGORY
  const handleDelete = async (id) => {
    if (!window.confirm("Delete category?")) return;
    await deleteDoc(doc(db, "categories", id));
  };

  // 🗑 DELETE SUBCATEGORY
  const handleDeleteSub = async (cat, sub) => {
    const ref = doc(db, "categories", cat.id);

    await updateDoc(ref, {
      subcategories: cat.subcategories.filter((s) => s !== sub),
    });
  };

  return (
    <Layout>
      <Typography variant="h5" mb={3}>
        Categories Management
      </Typography>

      {/* 🔥 ADD CATEGORY */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography>Add Category</Typography>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Subcategory (optional)"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" onClick={handleAdd}>
                Add
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 🔥 LIST */}
      <Grid container spacing={3}>
        {categories.map((cat) => (
          <Grid item xs={12} md={4} key={cat.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{cat.name}</Typography>

                <Typography variant="caption">
                  👤 {getUserName(cat.createdBy?.email)}
                </Typography>

                {/* SUBCATEGORIES */}
                <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
                  {cat.subcategories?.map((sub, i) => (
                    <Chip
                      key={i}
                      label={sub}
                      onDelete={() => handleDeleteSub(cat, sub)}
                    />
                  ))}
                </Stack>

                {/* ADD SUBCATEGORY */}
                <Stack direction="row" spacing={1} mt={2}>
                  <TextField
                    size="small"
                    placeholder="Add sub"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  />
                  <Button
                    size="small"
                    onClick={() => handleAddSub(cat)}
                  >
                    Add
                  </Button>
                </Stack>

                {/* DELETE */}
                <Button
                  color="error"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => handleDelete(cat.id)}
                >
                  Delete Category
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}