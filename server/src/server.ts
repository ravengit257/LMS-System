import express from "express";
import cors from 'cors';
import pool from './database.js'


const app = express();
app.use(express.json())

app.use(cors());

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM accounts WHERE username = $1 AND password = $2`,
      [username, password]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: "Username atau password salah" });
      return;
    }

    res.json({ message: "Login berhasil", user: result.rows[0] });
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
  const {username, password} = req.body
  if(!username || !password){
    res.status(400)
    return
  }

  try{
    await pool.query(
      `INSERT INTO accounts (username, password) VALUES ($1, $2)`,
      [username, password]
    );
    res.json('Registrasi Berhasil')
  }catch(err: any){
    if (err.code = '23505'){
      res.status(400).json({ message: "Username sudah dipakai" });
    }else{
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }

})

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
