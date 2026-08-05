"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaperById = exports.getPapers = exports.generatePaper = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const openaiGenerator_1 = require("../utils/openaiGenerator");
const generatePaper = async (req, res) => {
    try {
        const { title, subjectId, bookId, duration, maxMarks, config } = req.body;
        if (!title || !subjectId || !bookId || !config) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const book = await prisma_1.prisma.book.findUnique({ where: { id: bookId } });
        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }
        // Call OpenAI Generator
        const generatedSets = await (0, openaiGenerator_1.generateQuestionsSet)({
            subject: book.title, // or subject name
            numSets: config.numSets || 1,
            questionsPerSet: config.questionsPerSet || 10,
            difficulty: config.difficulty || { easy: 33, medium: 34, hard: 33 },
            questionTypes: config.questionTypes || ["MCQ", "Short Answer"],
            context: book.content
        });
        // Save to Database
        const paper = await prisma_1.prisma.paper.create({
            data: {
                title,
                subjectId,
                duration: duration || 120,
                maxMarks: maxMarks || 100,
                config: JSON.stringify(config),
                content: JSON.stringify(generatedSets),
            }
        });
        res.json({ success: true, message: "Paper generated successfully", paper });
    }
    catch (error) {
        console.error("Generate Paper Error:", error);
        res.status(500).json({ success: false, message: "Server error during generation" });
    }
};
exports.generatePaper = generatePaper;
const getPapers = async (req, res) => {
    try {
        const papers = await prisma_1.prisma.paper.findMany({
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
    }
    catch (error) {
        console.error("Get Papers Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getPapers = getPapers;
const getPaperById = async (req, res) => {
    try {
        const paper = await prisma_1.prisma.paper.findUnique({ where: { id: req.params.id } });
        if (!paper)
            return res.status(404).json({ success: false, message: "Paper not found" });
        res.json({ success: true, paper });
    }
    catch (error) {
        console.error("Get Paper Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getPaperById = getPaperById;
//# sourceMappingURL=paperController.js.map