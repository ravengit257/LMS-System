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
  const [activeTab, setActiveTab] = useState("users");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
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
    Promise.all([
      fetchUsers(),
      fetchCourses(),
    ]).finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (user_id: number, username: string) => {
    if(!confirm(`Yakin ingin menghapus user "${username}"?`)) return;
    try{
      await axios.delete(`http://localhost:5000/users/${user_id}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setMessage(`User "${username}" berhasil dihapus`);
      fetchUsers();
    }catch(err: any){
      setMessage(err.response?.data?.error || "Gagal menghapus user");
    }
  }

  const tabs = [
    { key: "users", label: "Semua User" },
    { key: "courses", label: "Semua Course" },
  ];

  const roleColors: Record<string, string> = {
    student: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    teacher: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    admin: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  };

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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-slate-400 text-sm">Memuat data...</p>
            </div>
          </div>
        ) : (<>
        {message && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium border bg-green-500/10 border-green-500/30 text-green-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {message}
            </div>
          </div>
        )}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Semua User</h2>
            {users.length === 0 ? (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
                <p className="text-slate-400">Belum ada user</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-700/50">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="text-left px-6 py-3 text-slate-400 text-sm font-medium">ID</th>
                      <th className="text-left px-6 py-3 text-slate-400 text-sm font-medium">Username</th>
                      <th className="text-left px-6 py-3 text-slate-400 text-sm font-medium">Role</th>
                      <th className="text-right px-6 py-3 text-slate-400 text-sm font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {users.map((u) => (
                      <tr key={u.user_id} className="bg-slate-800/40 hover:bg-slate-800/60 transition">
                        <td className="px-6 py-4 text-slate-300 text-sm">{u.user_id}</td>
                        <td className="px-6 py-4 text-white text-sm font-medium">{u.username}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium border ${roleColors[u.role] || "bg-slate-500/10 text-slate-400 border-slate-500/30"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.user_id, u.username)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "courses" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Semua Course</h2>
            {courses.length === 0 ? (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
                <p className="text-slate-400">Belum ada course</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {courses.map((course) => (
                  <div
                    key={course.course_id}
                    className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                    <p className="text-slate-400 text-sm mb-3">{course.description}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {course.teacher_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </></div>
    </div>
  );
}
