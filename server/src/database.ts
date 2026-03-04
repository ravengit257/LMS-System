import { Pool, Client } from "pg";
import dotenv from 'dotenv'
dotenv.config()

// Pool untuk digunakan di seluruh app
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

// Fungsi create database, dijalankan sekali saja
async function createDatabase() {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
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
  const createTblQry = `
    CREATE TABLE IF NOT EXISTS accounts (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(50) NOT NULL
    )
  `;

  try {
    await pool.query(createTblQry);
    console.log("Table accounts created");
  } catch (err) {
    console.error(err);
  }
}


createDatabase();
createTables();

export default pool;