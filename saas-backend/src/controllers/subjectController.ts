import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        books: { select: { id: true, title: true } }
      }
    });
    res.json({ success: true, subjects });
  } catch (error) {
    console.error("Get Subjects Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Subject name is required" });

    const existing = await prisma.subject.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ success: false, message: "Subject already exists" });

    const subject = await prisma.subject.create({ data: { name } });
    res.json({ success: true, subject });
  } catch (error) {
    console.error("Create Subject Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
