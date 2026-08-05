import fs from "fs";
import path from "path";
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";

export const extractTextFromFile = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (ext === ".txt") {
      return fs.readFileSync(filePath, "utf-8");
    } else {
      throw new Error("Unsupported file format");
    }
  } catch (error) {
    console.error("Text Extraction Error:", error);
    throw new Error("Failed to extract text from file");
  }
};
