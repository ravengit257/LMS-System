import { useState, useEffect } from "react";
import axios from "axios";

interface Course {
  course_id: number;
  title: string;
  description: string;
}

export default function TeacherDashboard({ user, onLogout }: any) {
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const token = localStorage.getItem("token");

  const fetchMyCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/mycourses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourses = async () => {
    try {
      await axios.post(
        "http://localhost:5000/courses",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTitle("");
      setDesc("");
      fetchMyCourses();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "50px auto" }}>
      <h2>Teacher Dashboard</h2>
      <p>
        Selamat datang, <strong>{user?.username}</strong>!
      </p>
      <button onClick={onLogout}>Logout</button>

      <hr />

      <h3>Buat Course Baru</h3>
      <div>
        <label>Judul Course</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul course"
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />
      </div>
      <div>
        <label>Deskripsi</label>
        <textarea
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Deskripsi course"
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />
      </div>
      <button onClick={handleCreateCourses}>Buat Course</button>

      <hr />

      <h3>Course Saya</h3>
      {courses.length === 0 ? (
        <p>Belum ada course yang dibuat</p>
      ) : (
        courses.map((course) => (
          <div
            key={course.course_id}
            style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
          >
            <h4>{course.title}</h4>
            <p>{course.description}</p>
          </div>
        ))
      )}
    </div>
  );
}
