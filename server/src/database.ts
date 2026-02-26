import {Pool} from "pg";

const pool = new Pool({
    user:"postgres",
    password:"123",
    host:"localhost",
    port: 5432,
    database:"postgres"
})

pool.query(`CREATE DATABASE login_system`)
  .then((response) => {
    console.log("Database created");
  })
  .catch((err) => {
    console.error(err);
  });

export default pool;