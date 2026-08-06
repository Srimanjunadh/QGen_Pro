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
import adminRoutes from "./routes/adminRoutes";
import studentRoutes from "./routes/studentRoutes";

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);

app.get("/", (req, res) => {
  res.send("SaaS Backend is running!");
});

import { prisma } from "./lib/prisma";
import bcrypt from "bcrypt";

const initializeAdmin = async () => {
  try {
    const adminExists = await prisma.user.findUnique({ where: { email: "Manju" } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("1122", 10);
      await prisma.user.create({
        data: {
          name: "Manju Admin",
          email: "Manju",
          password: hashedPassword,
          role: "ADMIN"
        }
      });
      console.log("Default admin account 'Manju' created automatically.");
    }
  } catch (err) {
    console.error("Failed to initialize admin:", err);
  }
};

app.listen(PORT, async () => {
  await initializeAdmin();
  console.log(`Server is running on port ${PORT}`);
});
