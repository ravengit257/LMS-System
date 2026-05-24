import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentDashboard from "./dashboard/studentdashboard";
import AdminDashboard from "./dashboard/admindashboard";
import TeacherDashboard from "./dashboard/teacherdashboard";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    const decoded = JSON.parse(atob(token.split(".")[1]));
    setUser(decoded);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  if (user?.role === "admin")
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  if (user?.role === "teacher")
    return <TeacherDashboard user={user} onLogout={handleLogout} />;
  if (user?.role === "student")
    return <StudentDashboard user={user} onLogout={handleLogout} />;
}
