import { useState, useEffect } from "react";
import axios from "axios";

interface Course {
  course_id: number;
  title: string;
  description: string;
  teacher_name: string;
}

interface User {
  user_id: number;
  username: string;
  role: string;
}

export default function AdminDashboard({ user, onLogout }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "50px auto" }}>
      <h2>Admin Dashboard</h2>
      <p>
        Selamat datang, <strong>{user?.username}</strong>!
      </p>
      <button onClick={onLogout}>Logout</button>

      <hr />

      <h3>Semua User</h3>
      {users.length === 0 ? (
        <p>Belum ada user</p>
      ) : (
        users.map((u) => (
          <div
            key={u.user_id}
            style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
          >
            <p>
              <strong>Username:</strong> {u.username}
            </p>
            <p>
              <strong>Role:</strong> {u.role}
            </p>
          </div>
        ))
      )}

      <hr />

      <h3>Semua Course</h3>
      {courses.length === 0 ? (
        <p>Belum ada course</p>
      ) : (
        courses.map((course) => (
          <div
            key={course.course_id}
            style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
          >
            <h4>{course.title}</h4>
            <p>{course.description}</p>
            <p>
              <strong>Teacher:</strong> {course.teacher_name}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
