import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateQuestionsSet } from "../utils/aiGenerator";

export const generatePaper = async (req: Request, res: Response) => {
  try {
    const { title, subjectName, topic, duration, maxMarks, config } = req.body;
    
    if (!title || !subjectName || !topic || !config) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Lookup or Create Subject
    let subject = await prisma.subject.findUnique({ where: { name: subjectName } });
    if (!subject) {
      subject = await prisma.subject.create({ data: { name: subjectName } });
    }

    // Call OpenAI Generator
    const topicString = Array.isArray(topic) ? topic.join(", ") : String(topic);
    const generatedSets = await generateQuestionsSet({
      subject: subject.name,
      topic: topicString,
      numSets: config.numSets || 1,
      questionsPerSet: config.questionsPerSet || 10,
      difficulty: config.difficulty || { easy: 33, medium: 34, hard: 33 },
      questionTypes: config.questionTypes || ["MCQ", "Short Answer"],
    });

    // Save to Database
    const paper = await prisma.paper.create({
      data: {
        title,
        subjectId: subject.id,
        duration: duration || 120,
        maxMarks: maxMarks || 100,
        config: JSON.stringify(config),
        content: JSON.stringify(generatedSets),
      }
    });

    res.json({ success: true, message: "Paper generated successfully", paper });
  } catch (error: any) {
    console.error("Generate Paper Error:", error);
    res.status(500).json({ success: false, message: "Server error during generation", error: error?.message || String(error) });
  }
};

export const getPapers = async (req: Request, res: Response) => {
  try {
    const papers = await prisma.paper.findMany({
      select: {
        id: true,
        title: true,
        subjectId: true,
        duration: true,
        maxMarks: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, papers });
  } catch (error) {
    console.error("Get Papers Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPaperById = async (req: Request, res: Response) => {
  try {
    const paper = await prisma.paper.findUnique({ where: { id: req.params.id } });
    if (!paper) return res.status(404).json({ success: false, message: "Paper not found" });
    
    res.json({ success: true, paper });
  } catch (error) {
    console.error("Get Paper Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
