"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: { name, email, password: hashedPassword },
        });
        res.json({ success: true, message: "Registration successful" });
    }
    catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: "1d",
        });
        res.json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map