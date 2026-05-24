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

export default function StudentDashboard({ user, onLogout }: any) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [schedules, setSchedules] = useState<Schedules[]>([]);
  const [message, setMessage] = useState<any>(null);
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
    fetchCourses();
    fetchEnrollments();
    fetchSchedules();
  }, []);

  const isEnrolled = (course_id: number) => {
    return enrollments.some((e) => e.course_id === course_id);
  };

return (
  <div style={{ maxWidth: 800, margin: "50px auto" }}>
    <h2>Student Dashboard</h2>
    <p>
      Selamat datang, <strong>{user?.username}</strong>!
    </p>
    <button onClick={onLogout}>Logout</button>
    <hr />
    <h3>Semua Courses</h3>
    {message && <p style={{ color: "green" }}>{message}</p>}
    {courses.length === 0 ? (
      <p>Belum ada course tersedia</p>
    ) : (
      courses.map((course) => (
        <div
          key={course.course_id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          <h4>{course.title}</h4>
          <p>{course.description}</p>
          <p>Teacher: {course.teacher_name}</p>
          {isEnrolled(course.course_id) ? (
            <button disabled>Sudah Enroll</button>
          ) : (
            <button onClick={() => handleEnroll(course.course_id)}>
              Enroll
            </button>
          )}
        </div>
      ))
    )}
    <hr />
    <h3>Course Saya</h3>
    {enrollments.length === 0 ? (
      <p>Belum enroll course apapun</p>
    ) : (
      enrollments.map((course) => (
        <div
          key={course.course_id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          <h4>{course.title}</h4>
          <p>{course.description}</p>
          <p>Teacher: {course.teacher_name}</p>
        </div>
      ))
    )}
    <hr />
    <h3>Jadwal Saya</h3>
    {schedules.length === 0 ? (
      <p>Belum ada jadwal</p>
    ) : (
      schedules.map((schedule) => (
        <div
          key={schedule.schedule_id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          <h4>{schedule.course_title}</h4>
          <p>Hari: {schedule.day}</p>
          <p>Jam: {schedule.start_time} - {schedule.end_time}</p>
          <p>Ruangan: {schedule.room}</p>
          <p>Teacher: {schedule.teacher_name}</p>
        </div>
      ))
    )}
  </div>
);
  
}
