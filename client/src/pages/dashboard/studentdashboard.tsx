import { useState, useEffect } from "react";
import axios from "axios";

interface Course {
  course_id: number;
  title: string;
  description: string;
  teacher_name: string;
}

interface Enrollment {
  course_id: number;
  title: string;
  description: string;
  teacher_name: string;
}

interface Schedules {
  schedule_id:number;
  course_id: number;
  day: string;
  start_time: string;
  end_time:string;
  room:string;
  course_title: string;
  teacher_name: string;
}

interface Grade {
  grade_id: number;
  course_id: number;
  grade: string;
  course_title: string;
  teacher_name: string;
}

interface Announcement {
  announcement_id: number;
  course_id: number;
  title: string;
  content: string;
  created_at: string;
  course_title: string;
  teacher_name: string;
}

export default function StudentDashboard({ user, onLogout }: any) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [schedules, setSchedules] = useState<Schedules[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [message, setMessage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("courses");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

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

  const fetchSchedules = async () => {
    try{
      const response = await axios.get("http://localhost:5000/student/schedules", {
        headers: {Authorization: `Bearer ${token}`},
      });
      setSchedules(response.data);
    }catch(err) {
      console.error(err);
    }
  }

  const fetchAnnouncements = async () => {
    try{
      const response = await axios.get("http://localhost:5000/myannouncements", {
        headers: {Authorization: `Bearer ${token}`},
      });
      setAnnouncements(response.data);
    }catch(err){
      console.error(err);
    }
  }

  const fetchGrades = async () => {
    try{
      const response = await axios.get("http://localhost:5000/mygrades", {
        headers: {Authorization: `Bearer ${token}`},
      });
      setGrades(response.data);
    }catch(err){
      console.error(err);
    }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/enrollments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrollments(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async (course_id: number) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/enroll",
        { course_id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessage(response.data.message);
      fetchEnrollments();
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Gagal enroll");
    }
  };

  useEffect(() => {
    Promise.all([
      fetchCourses(),
      fetchEnrollments(),
      fetchSchedules(),
      fetchGrades(),
      fetchAnnouncements(),
    ]).finally(() => setLoading(false));
  }, []);

  const isEnrolled = (course_id: number) => {
    return enrollments.some((e) => e.course_id === course_id);
  };

  const tabs = [
    { key: "courses", label: "Semua Course" },
    { key: "mycourses", label: "Course Saya" },
    { key: "schedules", label: "Jadwal" },
    { key: "grades", label: "Nilai" },
    { key: "announcements", label: "Pengumuman" },
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
        <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-green-500/10 border border-green-500/30 text-green-400">
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

      {activeTab === "courses" && (
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Semua Course</h2>
          {courses.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
              <p className="text-slate-400">Belum ada course tersedia</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <div
                  key={course.course_id}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                      <p className="text-slate-400 text-sm mb-3">{course.description}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {course.teacher_name}
                      </div>
                    </div>
                    <div>
                      {isEnrolled(course.course_id) ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Terdaftar
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.course_id)}
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer shadow-lg shadow-blue-500/20"
                        >
                          Enroll
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "mycourses" && (
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Course Saya</h2>
          {enrollments.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
              <p className="text-slate-400">Belum enroll course apapun</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {enrollments.map((course) => (
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

      {activeTab === "grades" && (
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Nilai Saya</h2>
          {grades.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
              <p className="text-slate-400">Belum ada nilai</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-700/50">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/80">
                    <th className="text-left px-6 py-3 text-slate-400 text-sm font-medium">Course</th>
                    <th className="text-left px-6 py-3 text-slate-400 text-sm font-medium">Nilai</th>
                    <th className="text-left px-6 py-3 text-slate-400 text-sm font-medium">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {grades.map((g) => (
                    <tr key={g.grade_id} className="bg-slate-800/40 hover:bg-slate-800/60 transition">
                      <td className="px-6 py-4 text-white text-sm font-medium">{g.course_title}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30">
                          {g.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{g.teacher_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "announcements" && (
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Pengumuman</h2>
          {announcements.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
              <p className="text-slate-400">Belum ada pengumuman</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {announcements.map((a) => (
                <div key={a.announcement_id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-white">{a.title}</h3>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(a.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3 whitespace-pre-wrap">{a.content}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{a.course_title}</span>
                    <span>oleh {a.teacher_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "schedules" && (
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Jadwal Saya</h2>
          {schedules.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
              <p className="text-slate-400">Belum ada jadwal</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.schedule_id}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">{schedule.course_title}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {schedule.day}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {schedule.room}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {schedule.teacher_name}
                    </div>
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
