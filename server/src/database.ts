import { Pool, Client } from "pg";
import dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

async function createDatabase() {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: "postgres", 
  });


  try {
    await client.connect();
    await client.query(`CREATE DATABASE login_system`);
    console.log("Database created");
  } catch (err: any) {
    if (err.code === "42P04") {
      console.log("Database sudah ada, skip...");
    } else {
      console.error(err);
    }
  } finally {
    await client.end();
  }
}

async function createTables() {
  try {
    // 1. Tabel accounts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        user_id  SERIAL PRIMARY KEY,
        username VARCHAR(50)  UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role     VARCHAR(20)  NOT NULL DEFAULT 'student'
      )
    `);
    console.log("Table accounts created");

    // 2. Tabel courses
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        course_id   SERIAL PRIMARY KEY,
        title       VARCHAR(100) NOT NULL,
        description TEXT,
        teacher_id  INTEGER REFERENCES accounts(user_id) ON DELETE SET NULL
      )
    `);
    console.log("Table courses created");

    // 3. Tabel enrollments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        enrollment_id SERIAL PRIMARY KEY,
        student_id    INTEGER REFERENCES accounts(user_id) ON DELETE CASCADE,
        course_id     INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
        UNIQUE(student_id, course_id)
      )
    `);
    console.log("Table enrollments created");

    // 4. Tabel schedules 
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        schedule_id SERIAL PRIMARY KEY,
        course_id   INTEGER NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
        day         VARCHAR(20) NOT NULL,
        start_time  TIME NOT NULL,
        end_time    TIME NOT NULL,
        room        VARCHAR(100),
        created_at  TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Table schedules created");

    //5. Tabel Nilai
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grades (
        grade_id    SERIAL PRIMARY KEY,
        student_id  INTEGER REFERENCES accounts(user_id) ON DELETE CASCADE,
        course_id   INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
        grade       VARCHAR(5) NOT NULL,
        created_at  TIMESTAMP DEFAULT NOW(),
        UNIQUE(student_id, course_id)
      )
        `);
      console.log("Tabel Nilai Created")

  } catch (err) {
    console.error(err);
  }
}

async function init() {
  await createDatabase();
  await createTables();
}

init();

export default pool;