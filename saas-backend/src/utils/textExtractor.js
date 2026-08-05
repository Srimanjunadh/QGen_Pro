"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const extractTextFromFile = async (filePath) => {
    const ext = path_1.default.extname(filePath).toLowerCase();
    try {
        if (ext === ".pdf") {
            const dataBuffer = fs_1.default.readFileSync(filePath);
            const data = await (0, pdf_parse_1.default)(dataBuffer);
            return data.text;
        }
        else if (ext === ".docx") {
            const result = await mammoth_1.default.extractRawText({ path: filePath });
            return result.value;
        }
        else if (ext === ".txt") {
            return fs_1.default.readFileSync(filePath, "utf-8");
        }
        else {
            throw new Error("Unsupported file format");
        }
    }
    catch (error) {
        console.error("Text Extraction Error:", error);
        throw new Error("Failed to extract text from file");
    }
};
exports.extractTextFromFile = extractTextFromFile;
//# sourceMappingURL=textExtractor.js.map