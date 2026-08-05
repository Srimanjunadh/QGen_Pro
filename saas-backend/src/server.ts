import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import paperRoutes from "./routes/paperRoutes";

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/papers", paperRoutes);

app.get("/", (req, res) => {
  res.send("SaaS Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
