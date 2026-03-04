import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(user));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{ maxWidth: 800, margin: "50px auto" }}>
      <h2>Dashboard</h2>
      <p>
        Selamat datang, <strong>{user?.username}</strong>!
      </p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
