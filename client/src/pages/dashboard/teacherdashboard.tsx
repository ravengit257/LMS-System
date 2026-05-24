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
  const [message, setMessage] = useState("");
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
    if (!title || !description) {
      setMessage("Judul dan deskripsi harus diisi");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/courses",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTitle("");
      setDesc("");
      setMessage("Course berhasil dibuat");
      fetchMyCourses();
    } catch (err) {
      console.error(err);
      setMessage("Gagal membuat course");
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-slate-800/60 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">LMS System</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm">Halo, <span className="text-white font-semibold">{user?.username}</span></span>
            <button
              onClick={onLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
            message === "Course berhasil dibuat"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            <div className="flex items-center gap-2">
              {message === "Course berhasil dibuat" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message}
            </div>
          </div>
        )}

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Buat Course Baru</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Judul Course</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul course"
                className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Deskripsi</label>
              <textarea
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Masukkan deskripsi course"
                rows={4}
                className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition resize-none"
              />
            </div>
            <button
              onClick={handleCreateCourses}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-blue-500/20"
            >
              Buat Course
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-6">Course Saya</h2>
          {courses.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
              <p className="text-slate-400">Belum ada course yang dibuat</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <div
                  key={course.course_id}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                  <p className="text-slate-400 text-sm">{course.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
