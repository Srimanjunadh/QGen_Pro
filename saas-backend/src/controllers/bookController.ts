import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { extractTextFromFile } from "../utils/textExtractor";
import fs from "fs";

export const uploadBook = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { title, subjectId, subjectName } = req.body;

    if (!file || !title || (!subjectId && !subjectName)) {
      return res.status(400).json({ success: false, message: "File, title, and subjectName are required" });
    }

    let finalSubjectId = subjectId;

    if (subjectName && !subjectId) {
      let subject = await prisma.subject.findUnique({ where: { name: subjectName } });
      if (!subject) {
        subject = await prisma.subject.create({ data: { name: subjectName } });
      }
      finalSubjectId = subject.id;
    } else {
      const subject = await prisma.subject.findUnique({ where: { id: finalSubjectId } });
      if (!subject) {
        return res.status(404).json({ success: false, message: "Subject not found" });
      }
    }

    console.log("1. Starting upload process for:", file.originalname);
    
    // Extract text
    console.log("2. Extracting text from:", file.path);
    const content = await extractTextFromFile(file.path);
    console.log("3. Text extraction successful. Length:", content.length);

    // Save to DB
    console.log("4. Saving book to DB...");
    const book = await prisma.book.create({
      data: {
        title,
        subjectId: finalSubjectId,
        format: file.mimetype,
        content,
      },
    });
    console.log("5. Book saved to DB successfully with ID:", book.id);

    // Optionally delete the physical file after extraction to save space, 
    // or keep it if download is required. We'll keep it for now.
    
    res.json({ success: true, message: "Book uploaded and processed successfully", book });
  } catch (error: any) {
    console.log("======= UPLOAD BOOK ERROR =======");
    console.log(error);
    console.log(error.message);
    console.log(error.stack);
    console.log("=================================");
    res.status(500).json({ success: false, message: "Failed to upload and process book", error: error?.message });
  }
};

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        subjectId: true,
        format: true,
        createdAt: true,
        // Exclude content because it's massive
      }
    });
    res.json({ success: true, books });
  } catch (error) {
    console.error("Get Books Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
