import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { loginUser } from "../firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#F8F9FB"
    >
      <Card sx={{ width: 350 }}>
        <CardContent>
          <Typography variant="h5">Login</Typography>

          <TextField
            fullWidth
            label="Email"
            sx={{ mt: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            sx={{ mt: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button fullWidth sx={{ mt: 2 }} onClick={handleLogin} variant="contained">
            Login
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}