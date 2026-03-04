import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage("Username dan password harus diisi");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate("/dashboard"), 1500);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Login</h2>

      <div>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Masukkan username"
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password"
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />
      </div>

      <button onClick={handleLogin}>Login</button>
      <p style={{ marginTop: 10 }}>
        Belum punya akun? <a href="/register">Register</a>
      </p>

      {message && (
        <p style={{ color: message === "Login berhasil" ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}
