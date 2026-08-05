"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestionsSet = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const generateQuestionsSet = async (config) => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API Key is missing");
    }
    const prompt = `
    You are an expert academic examiner creating a professional university-level question paper.
    Subject: ${config.subject}
    Sets Required: ${config.numSets}
    Questions Per Set: ${config.questionsPerSet}
    Difficulty Distribution: ${config.difficulty.easy}% Easy, ${config.difficulty.medium}% Medium, ${config.difficulty.hard}% Hard.
    Allowed Question Types: ${config.questionTypes.join(", ")}
    
    Source Material context (Extract questions ONLY from this material):
    ---
    ${config.context.substring(0, 15000)} // Truncated to fit standard context limits
    ---
    
    Generate the question sets exactly as a JSON array of sets.
    Each set must have 'setNumber' and a 'questions' array.
    Each question must have:
    - id: unique string
    - type: string (one of the allowed types)
    - difficulty: string (Easy, Medium, Hard)
    - question: string (the actual question text)
    - marks: number
    
    Ensure strict randomization and NO duplicates across sets.
    Return ONLY valid JSON.
  `;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Using mini for speed and context window
            messages: [
                { role: "system", content: "You are an API that outputs strictly valid JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });
        const result = response.choices[0].message.content;
        if (!result)
            throw new Error("No content received from OpenAI");
        return JSON.parse(result);
    }
    catch (error) {
        console.error("OpenAI Generation Error:", error);
        throw new Error("Failed to generate questions via AI");
    }
};
exports.generateQuestionsSet = generateQuestionsSet;
//# sourceMappingURL=openaiGenerator.js.map