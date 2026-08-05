"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooks = exports.uploadBook = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const textExtractor_1 = require("../utils/textExtractor");
const fs_1 = __importDefault(require("fs"));
const uploadBook = async (req, res) => {
    try {
        const file = req.file;
        const { title, subjectId } = req.body;
        if (!file || !title || !subjectId) {
            return res.status(400).json({ success: false, message: "File, title, and subjectId are required" });
        }
        // Verify subject exists
        const subject = await prisma_1.prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }
        // Extract text
        const content = await (0, textExtractor_1.extractTextFromFile)(file.path);
        // Save to DB
        const book = await prisma_1.prisma.book.create({
            data: {
                title,
                subjectId,
                format: file.mimetype,
                content,
            },
        });
        // Optionally delete the physical file after extraction to save space, 
        // or keep it if download is required. We'll keep it for now.
        res.json({ success: true, message: "Book uploaded and processed successfully", book });
    }
    catch (error) {
        console.error("Upload Book Error:", error);
        res.status(500).json({ success: false, message: "Failed to upload and process book" });
    }
};
exports.uploadBook = uploadBook;
const getBooks = async (req, res) => {
    try {
        const books = await prisma_1.prisma.book.findMany({
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
    }
    catch (error) {
        console.error("Get Books Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getBooks = getBooks;
//# sourceMappingURL=bookController.js.map