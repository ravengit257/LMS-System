import express from "express";
import cors from 'cors';
import pool from './database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { request } from "node:http";

const app = express();
app.use(express.json())

app.use(cors());

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query(
      `SELECT * FROM accounts WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: "Username atau password salah" });
      return;
    }
    const pwdcompare = await bcrypt.compare(password, result.rows[0].password)
    if(!pwdcompare){
      res.status(401).json({ message: "Username atau password salah" });
      return
    }
    const role = result.rows[0].role
    const user_id = result.rows[0].user_id
    const token = jwt.sign({user_id, username, role}, process.env.JWTSECRET as string, {expiresIn:"1d"})
    res.json({ message: "Login berhasil", token: token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/adduser", (req, res) => {
  const username = req.body.username
  const password = req.body.password

  console.log("Username: " + username)
  console.log("Password: " + password)

  const insertSTMT = `INSERT INTO accounts (username, password) VALUES ('${username}', '${password}')`
  pool.query(insertSTMT).then((response) => {
    console.log("Data Saved")
    console.log(response)
  }).catch((err) => {
    console.log(err)
  })

  console.log(req.query);
  res.send("Received");
});

app.post('/register', async (req, res) =>{
  const {username, password, role} = req.body
  if(!username || !password){
    res.status(400)
    return
  }

  try{
    const hashed = await bcrypt.hash(password, 10)
    await pool.query(
      `INSERT INTO accounts (username, password, role) VALUES ($1, $2, $3)`,
      [username, hashed, role || 'student']
    );
    res.json({message: "Registrasi Berhasil"})
  }catch(err: any){
    if (err.code === '23505'){
      res.status(400).json({ message: "Username sudah dipakai" });
    }else{
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }

})

app.post("/courses", async (req, res) => {
  const {title, description} = req.body

  const token = req.headers.authorization?.split(" ")[1];
  const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);

  try{
    await pool.query(
      `INSERT INTO courses (title, description, teacher_id) VALUES ($1, $2, $3)`,
      [title, description, decoded.user_id]
    );
    res.json({message: "Course Berhasil dibuat"})
  }catch(err){
    console.error(err)
    res.status(500).json({ error: "Server error" });
  }
})

app.get("/courses", async (req, res)=> {
  try{
    const result = await pool.query(`
      SELECT courses.course_id, courses.title, courses.description, courses.teacher_id, accounts.username as teacher_name 
      FROM courses 
      JOIN accounts ON courses.teacher_id = accounts.user_id
      `)
      res.json(result.rows)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: "Server error" });
  }
})

app.post("/enroll", async (req, res) =>{
  const {course_id} = req.body

  const token = req.headers.authorization?.split(" ")[1];
  const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);

  try{
    await pool.query(`INSERT INTO enrollments (student_id, course_id) VALUES($1, $2)`,
      [decoded.user_id, course_id]
    );
    res.json({message: "Enrollment Berhasil"})
  }catch(err: any){
    if (err.code === "23505") {
      res.status(400).json({ message: "Sudah enroll course ini" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Server error" });
  }
}
})

app.get("/enrollments", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);

  try{
    const result = await pool.query(`
      SELECT courses.course_id, courses.title, courses.description, accounts.username as teacher_name
      FROM enrollments
      JOIN courses ON enrollments.course_id = courses.course_id
      JOIN accounts ON courses.teacher_id = accounts.user_id
      WHERE enrollments.student_id = $1
      `, [decoded.user_id])
      res.json(result.rows)
  }catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }

})

app.get('/mycourses', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
  console.log("decoded : ", decoded)
  try{
    const result = await pool.query(`
      SELECT course_id, title, description, teacher_id FROM courses WHERE teacher_id = $1
      `, [decoded.user_id]);
      res.json(result.rows)
      console.log("result : ", result.rows)
  }catch(err){
    console.error(err);
  }
})

app.get('/users', async (req, res)=>{
  try{
    const result = await pool.query(`
      SELECT user_id, username, role FROM accounts
      `)
      res.json(result.rows)
  }catch(err){
    console.error(err)
  }
})

app.post('/schedules', async (req, res) => {
  const {course_id, day, start_time, end_time, room} = req.body
  const token = req.headers.authorization?.split(" ")[1];

  try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role != "teacher" && decoded.role != "admin"){
      res.status(403).json({ error: "Access Denied" });
      return
    }else{
      await pool.query(`
      INSERT INTO schedules (course_id, day, start_time, end_time, room) VALUES($1, $2, $3, $4, $5)`
      , [course_id, day, start_time, end_time, room]);
      res.json({message: "Schedule Berhasil Dibuat"})
    }
  }catch(err){
    console.error(err)
    res.status(500).json({ error: "Server Error" });
  }

})

app.get("/schedules", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role != "admin"){
      res.status(403).json({ error: "Access Denied" });
      return
    }else{
      const result = await pool.query(`
        SELECT s.*, c.title AS course_title, a.username AS teacher_name
        FROM schedules s
        JOIN courses c ON s.course_id = c.course_id
        JOIN accounts a ON c.teacher_id = a.user_id
        `)
        res.json(result.rows)
    }
  }catch(err){
    console.error(err)
  }
})

app.get("/myschedules", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role != "teacher"){
      res.status(403).json({ error: "Access Denied" });
      return
    }else{
      const result = await pool.query(`
        SELECT s.*, c.title AS course_title
        FROM schedules s
        JOIN courses c ON s.course_id = c.course_id
        WHERE c.teacher_id = $1
        `, [decoded.user_id])
        res.json(result.rows)
    }
  }catch(err){
    console.error(err)
  }
})


app.get("/student/schedules", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role != "student"){
      res.status(403).json({ error: "Access Denied" });
      return
    }else{
      const result = await pool.query(`
        SELECT s.*, c.title AS course_title
        FROM schedules s 
        JOIN enrollments e ON s.course_id = e.course_id
        JOIN courses c ON s.course_id = c.course_id
        WHERE student_id = $1
        `, [decoded.user_id])
        res.json(result.rows)
    }
  }catch(err){
    console.error(err)
  }
})


app.delete('/schedules/:id', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
    try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role == "student"){
      res.status(403).json({ error: "Access Denied" });
      return
    }else{
      await pool.query(`
        DELETE FROM schedules
        WHERE schedule_id = $1
        `, [req.params.id]);res.json({message: "Schedule Berhasil Dihapus"})
    }
}catch(err){
  console.error(err)
}
}
)

app.post('/grades', async (req, res) => {
  const {student_id, course_id, grade} = req.body
  const token = req.headers.authorization?.split(" ")[1];
  try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role != "teacher"){
      res.status(403).json({ error: "Access Denied" });
      return
    }else{
      await pool.query(`
        INSERT INTO grades (student_id, course_id, grade) VALUES($1, $2, $3)`,
        [student_id, course_id, grade]);res.json({message: "Nilai berhasil di input"})
    }
  }catch(err){
    res.status(500).json({ error: "Server error" });
  }
})

app.get('/grades/:course_id', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role != "teacher"){
      res.status(403).json({ error: "Access Denied" });
      return
    }
    const course = await pool.query(`SELECT teacher_id FROM courses WHERE course_id = $1`, [req.params.course_id]);
    if(course.rows.length === 0 || course.rows[0].teacher_id !== decoded.user_id){
      res.status(403).json({ error: "Bukan course anda" });
      return
    }
    const result = await pool.query(`
      SELECT g.grade_id, g.student_id, g.grade, a.username AS student_name
      FROM grades g
      JOIN accounts a ON g.student_id = a.user_id
      WHERE g.course_id = $1
    `, [req.params.course_id]);
    res.json(result.rows)
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
})

app.get('/mygrades', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role != "student"){
      res.status(403).json({ error: "Access Denied" });
      return
    }
    const result = await pool.query(`
      SELECT g.grade_id, g.grade, g.course_id, c.title AS course_title, a.username AS teacher_name
      FROM grades g
      JOIN courses c ON g.course_id = c.course_id
      JOIN accounts a ON c.teacher_id = a.user_id
      WHERE g.student_id = $1
    `, [decoded.user_id]);
    res.json(result.rows)
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
})

app.get('/enrolled-students/:course_id', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role != "teacher"){
      res.status(403).json({ error: "Access Denied" });
      return
    }
    const course = await pool.query(`SELECT teacher_id FROM courses WHERE course_id = $1`, [req.params.course_id]);
    if(course.rows.length === 0 || course.rows[0].teacher_id !== decoded.user_id){
      res.status(403).json({ error: "Bukan course anda" });
      return
    }
    const result = await pool.query(`
      SELECT a.user_id, a.username
      FROM enrollments e
      JOIN accounts a ON e.student_id = a.user_id
      WHERE e.course_id = $1
    `, [req.params.course_id]);
    res.json(result.rows)
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
})

app.post('/announcements', async (req, res) => {
  const {course_id, title, content} = req.body
  const token = req.headers.authorization?.split(" ")[1];
  try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role != "teacher"){
      res.status(403).json({ error: "Access Denied" });
      return
    }
    const course = await pool.query(`SELECT teacher_id FROM courses WHERE course_id = $1`, [course_id]);
    if(course.rows.length === 0 || course.rows[0].teacher_id !== decoded.user_id){
      res.status(403).json({ error: "Bukan course anda" });
      return
    }
    await pool.query(`
      INSERT INTO announcements (course_id, title, content) VALUES($1, $2, $3)`,
      [course_id, title, content]);
    res.json({message: "Pengumuman berhasil dibuat"})
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
})

app.get('/announcements/:course_id', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role != "teacher"){
      res.status(403).json({ error: "Access Denied" });
      return
    }
    const result = await pool.query(`
      SELECT * FROM announcements WHERE course_id = $1 ORDER BY created_at DESC`,
      [req.params.course_id]);
    res.json(result.rows)
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
})

app.get('/myannouncements', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try{
    const decoded: any = jwt.verify(token!, process.env.JWTSECRET as string);
    if(decoded.role != "student"){
      res.status(403).json({ error: "Access Denied" });
      return
    }
    const result = await pool.query(`
      SELECT a.*, c.title AS course_title, ac.username AS teacher_name
      FROM announcements a
      JOIN courses c ON a.course_id = c.course_id
      JOIN accounts ac ON c.teacher_id = ac.user_id
      JOIN enrollments e ON a.course_id = e.course_id
      WHERE e.student_id = $1
      ORDER BY a.created_at DESC
    `, [decoded.user_id]);
    res.json(result.rows)
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
})

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
