"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubject = exports.getSubjects = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const getSubjects = async (req, res) => {
    try {
        const subjects = await prisma_1.prisma.subject.findMany({
            include: {
                books: { select: { id: true, title: true } }
            }
        });
        res.json({ success: true, subjects });
    }
    catch (error) {
        console.error("Get Subjects Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getSubjects = getSubjects;
const createSubject = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name)
            return res.status(400).json({ success: false, message: "Subject name is required" });
        const existing = await prisma_1.prisma.subject.findUnique({ where: { name } });
        if (existing)
            return res.status(400).json({ success: false, message: "Subject already exists" });
        const subject = await prisma_1.prisma.subject.create({ data: { name } });
        res.json({ success: true, subject });
    }
    catch (error) {
        console.error("Create Subject Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.createSubject = createSubject;
//# sourceMappingURL=subjectController.js.map