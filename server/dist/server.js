import express from "express";
import cors from 'cors';
const app = express();
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
    res.send("Server jalan 🚀");
});
app.listen(4000, () => {
    console.log("Server running at http://localhost:4000");
});
//# sourceMappingURL=server.js.map