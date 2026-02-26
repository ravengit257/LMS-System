import express from "express";
import cors from 'cors';


const app = express();
app.use(express.json())

app.use(cors());

app.get("/adduser", (req, res) => {
  console.log(req.query);
  res.send("Received");
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
