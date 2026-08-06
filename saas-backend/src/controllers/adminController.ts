import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";

// Generate Registration Codes
export const generateCodes = async (req: Request, res: Response) => {
  try {
    const { count } = req.body;
    if (!count || count < 1) {
      return res.status(400).json({ error: "Invalid count" });
    }

    // Generate ONE code that can be used `count` times
    const codeStr = uuidv4().split("-")[0].toUpperCase() + uuidv4().split("-")[1].toUpperCase();
    
    const newCode = await prisma.registrationCode.create({
      data: {
        code: codeStr,
        maxUses: count,
        currentUses: 0,
      },
    });

    res.json({ message: `Code generated successfully for ${count} students`, codes: [newCode] });
  } catch (error) {
    console.error("Error generating codes:", error);
    res.status(500).json({ error: "Failed to generate codes" });
  }
};

// Get all students
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        code: true,
        assignments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// Update student status (suspend, block, extend)
export const updateStudentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, validUntil } = req.body;

    const updated = await prisma.student.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(validUntil && { validUntil: new Date(validUntil) }),
      },
    });

    res.json({ message: "Student updated successfully", student: updated });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
};

// Publish exam and assign to all active students
export const publishExam = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;
    const { positiveMarks, negativeMarks } = req.body;

    // Update the paper to published and set marks
    const paper = await prisma.paper.update({
      where: { id: paperId },
      data: {
        isPublished: true,
        positiveMarks: parseFloat(positiveMarks) || 1,
        negativeMarks: parseFloat(negativeMarks) || 0,
      },
    });

    // Assign to all ACTIVE students
    const activeStudents = await prisma.student.findMany({
      where: { status: "ACTIVE" },
    });

    const assignments = activeStudents.map((student) => ({
      studentId: student.id,
      paperId: paper.id,
    }));

    // Insert assignments, ignoring duplicates
    for (const assignment of assignments) {
      await prisma.examAssignment.upsert({
        where: {
          studentId_paperId: {
            studentId: assignment.studentId,
            paperId: assignment.paperId,
          },
        },
        update: {},
        create: assignment,
      });
    }

    res.json({
      message: `Exam published and assigned to ${activeStudents.length} students.`,
      paper,
    });
  } catch (error) {
    console.error("Error publishing exam:", error);
    res.status(500).json({ error: "Failed to publish exam" });
  }
};

// Get stats for a published exam
export const getExamStats = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;

    const assignments = await prisma.examAssignment.findMany({
      where: { paperId },
      include: {
        student: true,
      },
    });

    const totalAssigned = assignments.length;
    const started = assignments.filter((a) => a.status === "STARTED" || a.status === "COMPLETED").length;
    const completed = assignments.filter((a) => a.status === "COMPLETED").length;

    res.json({
      totalAssigned,
      started,
      completed,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching exam stats:", error);
    res.status(500).json({ error: "Failed to fetch exam stats" });
  }
};
