import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export const register = async (req: Request, res: Response) => {
  try {
    const { code, registrationNumber, password, name, year, section, mlNumber, fatherName, mobileNumber } = req.body;

    if (!code || !registrationNumber || !password || !name) {
      return res.status(400).json({ success: false, message: "Code, College Registration Number, Password, and Name are required" });
    }

    // Check if the code is valid
    const registrationCode = await prisma.registrationCode.findUnique({
      where: { code },
    });

    if (!registrationCode || !registrationCode.isValid || registrationCode.currentUses >= registrationCode.maxUses) {
      return res.status(400).json({ success: false, message: "Invalid or expired registration code" });
    }

    // Check if a student with this registration number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { registrationNumber },
    });

    if (existingStudent) {
      return res.status(400).json({ success: false, message: "Student already registered with this College ID" });
    }

    // Create the student
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await prisma.student.create({
      data: {
        registrationNumber,
        password: hashedPassword,
        name,
        year: year || "",
        section: section || "",
        mlNumber: mlNumber || "",
        fatherName: fatherName || "",
        mobileNumber: mobileNumber || "",
        codeId: registrationCode.id,
      },
    });

    // Increment usage and invalidate if limit reached
    const newUses = registrationCode.currentUses + 1;
    await prisma.registrationCode.update({
      where: { code },
      data: {
        currentUses: newUses,
        isValid: newUses < registrationCode.maxUses,
      },
    });

    res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("Student Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { registrationNumber, password } = req.body;

    const student = await prisma.student.findUnique({
      where: { registrationNumber },
    });

    if (!student) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (student.status !== "ACTIVE") {
      return res.status(403).json({ success: false, message: `Account is ${student.status.toLowerCase()}` });
    }

    if (student.validUntil && new Date() > student.validUntil) {
      return res.status(403).json({ success: false, message: "Account validity has expired" });
    }

    const isValid = await bcrypt.compare(password, student.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: student.id, registrationNumber: student.registrationNumber, role: "STUDENT" }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: student.id, name: student.name, registrationNumber: student.registrationNumber, role: "STUDENT" },
    });
  } catch (error) {
    console.error("Student Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get assigned exams for the logged in student
export const getAssignedExams = async (req: Request, res: Response) => {
  try {
    // We assume the user ID is passed from an auth middleware, for now let's just use studentId from params
    // In a real app, use req.user.id
    const studentId = req.params.studentId as string;

    const assignments = await prisma.examAssignment.findMany({
      where: { studentId },
      include: {
        paper: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assigned exams:", error);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
};

// Get exam assignment details to start
export const getExamDetails = async (req: Request, res: Response) => {
  try {
    const assignmentId = req.params.assignmentId as string;

    const assignment = await prisma.examAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        paper: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (assignment.status === "PENDING") {
      // Mark as started
      await prisma.examAssignment.update({
        where: { id: assignmentId },
        data: {
          status: "STARTED",
          startedAt: new Date(),
        },
      });
    }

    res.json(assignment);
  } catch (error) {
    console.error("Error fetching exam details:", error);
    res.status(500).json({ error: "Failed to fetch exam details" });
  }
};

// Submit Exam
export const submitExam = async (req: Request, res: Response) => {
  try {
    const assignmentId = req.params.assignmentId as string;
    const { answers, marks, reportData } = req.body;

    const updated = await prisma.examAssignment.update({
      where: { id: assignmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        marks: parseFloat(marks) || 0,
        reportData: JSON.stringify(reportData),
      },
    });

    res.json({ message: "Exam submitted successfully", assignment: updated });
  } catch (error) {
    console.error("Error submitting exam:", error);
    res.status(500).json({ error: "Failed to submit exam" });
  }
};
