import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password || !confirm) {
      setMessage("Semua kolom harus diisi!");
      return;
    }
    if (password !== confirm) {
      setMessage("Password tidak cocok");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/register", {
        username,
        password,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Registrasi Gagal");
    }
  };
  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Register</h2>

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

      <div>
        <label>Konfirmasi Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Ulangi password"
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />
      </div>

      <button onClick={handleRegister}>Register</button>
      <p style={{ marginTop: 10 }}>
        Sudah punya akun? <a href="/">Login</a>
      </p>

      {message && (
        <p
          style={{ color: message === "Registrasi berhasil" ? "green" : "red" }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
