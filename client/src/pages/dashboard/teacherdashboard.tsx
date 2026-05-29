import { useState, useEffect } from "react";
import axios from "axios";

interface Course {
  course_id: number;
  title: string;
  description: string;
}

interface Student {
  user_id: number;
  username: string;
}

interface GradeView {
  grade_id: number;
  student_id: number;
  grade: string;
  student_name: string;
}

export default function TeacherDashboard({ user, onLogout }: any) {
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("create");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<GradeView[]>([]);
  const [gradeInputs, setGradeInputs] = useState<Record<number, string>>({});

  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [courseStudents, setCourseStudents] = useState<Record<number, Student[]>>({});

  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceContent, setAnnounceContent] = useState("");
  const [announceCourse, setAnnounceCourse] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

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

  const fetchStudents = async (course_id: string) => {
    try{
      const response = await axios.get(`http://localhost:5000/enrolled-students/${course_id}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setStudents(response.data);
    }catch(err){
      console.error(err);
    }
  }

  const fetchGrades = async (course_id: string) => {
    try{
      const response = await axios.get(`http://localhost:5000/grades/${course_id}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setGrades(response.data);
      const inputs: Record<number, string> = {};
      response.data.forEach((g: GradeView) => {
        inputs[g.student_id] = g.grade;
      });
      setGradeInputs(inputs);
    }catch(err){
      console.error(err);
    }
  }

  const handleCourseSelect = (course_id: string) => {
    setSelectedCourse(course_id);
    if(course_id){
      fetchStudents(course_id);
      fetchGrades(course_id);
    }else{
      setStudents([]);
      setGrades([]);
      setGradeInputs({});
    }
  }

  const handleSubmitGrade = async (student_id: number) => {
    const grade = gradeInputs[student_id];
    if(!grade || !selectedCourse) return;
    try{
      await axios.post("http://localhost:5000/grades",
        {student_id, course_id: Number(selectedCourse), grade},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      setMessage(`Nilai untuk ${students.find(s => s.user_id === student_id)?.username} berhasil diinput`);
      fetchGrades(selectedCourse);
    }catch(err: any){
      setMessage(err.response?.data?.error || "Gagal input nilai");
    }
  }

  const toggleStudents = async (course_id: number) => {
    if(expandedCourse === course_id){
      setExpandedCourse(null);
      return;
    }
    setExpandedCourse(course_id);
    try{
      const response = await axios.get(`http://localhost:5000/enrolled-students/${course_id}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setCourseStudents({...courseStudents, [course_id]: response.data});
    }catch(err){
      console.error(err);
    }
  }

  useEffect(() => {
    fetchMyCourses().finally(() => setLoading(false));
  }, []);

  const handleDeleteCourse = async (course_id: number) => {
    if(!confirm("Yakin ingin menghapus course ini?")) return;
    try{
      await axios.delete(`http://localhost:5000/courses/${course_id}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setMessage("Course berhasil dihapus");
      fetchMyCourses();
    }catch(err: any){
      setMessage(err.response?.data?.error || "Gagal menghapus course");
    }
  }

  const handleEditClick = (course: Course) => {
    setEditCourse(course);
    setEditTitle(course.title);
    setEditDesc(course.description);
  }

  const handleUpdateCourse = async () => {
    if(!editTitle || !editDesc || !editCourse) return;
    try{
      await axios.put(`http://localhost:5000/courses/${editCourse.course_id}`,
        {title: editTitle, description: editDesc},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      setMessage("Course berhasil diupdate");
      setEditCourse(null);
      fetchMyCourses();
    }catch(err: any){
      setMessage(err.response?.data?.error || "Gagal update course");
    }
  }

  const fetchAnnouncements = async (course_id: string) => {
    try{
      const response = await axios.get(`http://localhost:5000/announcements/${course_id}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setAnnouncements(response.data);
    }catch(err){
      console.error(err);
    }
  }

  const handleCreateAnnouncement = async () => {
    if(!announceTitle || !announceContent || !announceCourse){
      setMessage("Semua kolom harus diisi");
      return;
    }
    try{
      await axios.post("http://localhost:5000/announcements",
        {course_id: Number(announceCourse), title: announceTitle, content: announceContent},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      setAnnounceTitle("");
      setAnnounceContent("");
      setMessage("Pengumuman berhasil dibuat");
      fetchAnnouncements(announceCourse);
    }catch(err: any){
      setMessage(err.response?.data?.error || "Gagal membuat pengumuman");
    }
  }

  const tabs = [
    { key: "create", label: "Buat Course" },
    { key: "grades", label: "Input Nilai" },
    { key: "announcements", label: "Pengumuman" },
    { key: "mycourses", label: "Course Saya" },
  ];

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
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
            message === "Course berhasil dibuat" || message.startsWith("Nilai")
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            <div className="flex items-center gap-2">
              {message === "Course berhasil dibuat" || message.startsWith("Nilai") ? (
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

        {activeTab === "create" && (
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
        )}

        {activeTab === "grades" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Input Nilai</h2>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 mb-6">
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Pilih Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => handleCourseSelect(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              >
                <option value="" className="bg-slate-900">-- Pilih Course --</option>
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id} className="bg-slate-900">{c.title}</option>
                ))}
              </select>
            </div>

            {selectedCourse && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="text-left px-6 py-3 text-slate-400 text-sm font-medium">Student</th>
                      <th className="text-left px-6 py-3 text-slate-400 text-sm font-medium">Nilai</th>
                      <th className="text-left px-6 py-3 text-slate-400 text-sm font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                          Belum ada student terdaftar
                        </td>
                      </tr>
                    ) : (
                      students.map((s) => (
                        <tr key={s.user_id} className="bg-slate-800/40 hover:bg-slate-800/60 transition">
                          <td className="px-6 py-4 text-white text-sm font-medium">{s.username}</td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={gradeInputs[s.user_id] || ""}
                              onChange={(e) => setGradeInputs({...gradeInputs, [s.user_id]: e.target.value})}
                              placeholder="A/B/C/D/E"
                              className="w-24 bg-slate-900/50 border border-slate-600/50 text-white rounded-lg px-3 py-1.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleSubmitGrade(s.user_id)}
                              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer shadow-lg shadow-blue-500/20"
                            >
                              Simpan
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "announcements" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Buat Pengumuman</h2>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">Pilih Course</label>
                  <select
                    value={announceCourse}
                    onChange={(e) => {setAnnounceCourse(e.target.value); if(e.target.value) fetchAnnouncements(e.target.value)}}
                    className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                  >
                    <option value="" className="bg-slate-900">-- Pilih Course --</option>
                    {courses.map((c) => (
                      <option key={c.course_id} value={c.course_id} className="bg-slate-900">{c.title}</option>
                    ))}
                  </select>
                </div>
                {announceCourse && (
                  <>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-1.5">Judul Pengumuman</label>
                      <input
                        type="text"
                        value={announceTitle}
                        onChange={(e) => setAnnounceTitle(e.target.value)}
                        placeholder="Judul pengumuman"
                        className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-1.5">Isi Pengumuman</label>
                      <textarea
                        value={announceContent}
                        onChange={(e) => setAnnounceContent(e.target.value)}
                        placeholder="Isi pengumuman"
                        rows={4}
                        className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition resize-none"
                      />
                    </div>
                    <button
                      onClick={handleCreateAnnouncement}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-blue-500/20"
                    >
                      Kirim Pengumuman
                    </button>
                  </>
                )}
              </div>
            </div>

            {announceCourse && announcements.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Riwayat Pengumuman</h3>
                <div className="grid gap-4">
                  {announcements.map((a: any) => (
                    <div key={a.announcement_id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="text-white font-semibold">{a.title}</h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(a.created_at).toLocaleDateString("id-ID")}</span>
                      </div>
                      <p className="text-slate-400 text-sm whitespace-pre-wrap">{a.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "mycourses" && (
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
                    {editCourse?.course_id === course.course_id ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Edit Course</h3>
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-1.5">Judul</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-1.5">Deskripsi</label>
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleUpdateCourse} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer shadow-lg shadow-blue-500/20">
                            Simpan
                          </button>
                          <button onClick={() => setEditCourse(null)} className="bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (<>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                          <p className="text-slate-400 text-sm">{course.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(course)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStudents(course.course_id)}
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
                          >
                            {expandedCourse === course.course_id ? "Tutup" : "Student"}
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.course_id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                      {expandedCourse === course.course_id && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <p className="text-slate-400 text-xs font-medium mb-2">Daftar Student:</p>
                          {courseStudents[course.course_id]?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {courseStudents[course.course_id].map((s) => (
                                <span key={s.user_id} className="inline-flex items-center gap-1.5 bg-slate-900/50 text-slate-300 border border-slate-600/50 px-3 py-1 rounded-lg text-xs">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {s.username}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-500 text-xs">Belum ada student terdaftar</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                ))}
              </div>
            )}
          </div>
        )}
      </></div>
    </div>
  );
}
