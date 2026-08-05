import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config({ override: true });

interface Config {
  subject: string;
  numSets: number;
  questionsPerSet: number;
  difficulty: { easy: number; medium: number; hard: number };
  questionTypes: string[];
  topic: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateQuestionsSet = async (config: Config) => {
  dotenv.config({ override: true });
  
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API Key is missing");
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const generateBatch = async (batchNumSets: number, startIndex: number, previousContext: string = "") => {
    const prompt = `
      You are an expert academic examiner creating a professional university-level question paper.
      Subject: ${config.subject}
      Specific Topic: ${config.topic}
      Sets Required for this batch: ${batchNumSets} (Start numbering from Set ${startIndex})
      Questions Per Set: ${config.questionsPerSet}
      Difficulty Distribution: ${config.difficulty.easy}% Easy, ${config.difficulty.medium}% Medium, ${config.difficulty.hard}% Hard.
      Allowed Question Types: ${config.questionTypes.join(", ")}
      
      CRITICAL REQUIREMENT: You MUST generate exactly ${batchNumSets} sets. Do not generate fewer. If you are struggling to find unique questions, it is acceptable to rephrase or slightly modify similar concepts, but you MUST output exactly ${batchNumSets} sets.
      
      Generate the question sets exactly as a JSON array of sets. 
      The root object should be { "sets": [ ... ] }.
      Each set must have 'setNumber' (start at ${startIndex}) and a 'questions' array.
      Each question must have:
      - id: unique string
      - type: string (one of the allowed types)
      - difficulty: string (Easy, Medium, Hard)
      - question: string (the actual question text)
      - marks: number
      - options: array of 4 strings (ONLY if type is "MCQ")
      - correctAnswer: string (the exact correct string from options, ONLY if type is "MCQ")
      
      Return ONLY valid JSON. Do NOT include markdown blocks.
      ${previousContext ? `\nAvoid generating questions identical to these previously generated ones to ensure variety:\n${previousContext}` : ''}
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a JSON API. You MUST output strictly valid JSON without any markdown formatting. Output format: { \"sets\": [ ... ] }" },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error("No content received from Groq");
    
    try {
      return JSON.parse(result);
    } catch (e) {
      console.error("JSON Parse failed for output:", result);
      throw new Error("AI returned malformed data (possibly hit token limit)");
    }
  };

  try {
    let allSets: any[] = [];
    // Lowered maxSetsPerBatch from 3 to 2 to heavily reduce token load per request
    const maxSetsPerBatch = 2; 
    let remainingSets = config.numSets;
    let currentStartIndex = 1;
    let previousQuestionsSummaries: string[] = [];

    while (remainingSets > 0) {
      const setsToGenerate = Math.min(remainingSets, maxSetsPerBatch);
      const context = previousQuestionsSummaries.slice(-10).join(" | "); 

      const batchResult = await generateBatch(setsToGenerate, currentStartIndex, context);
      
      const parsedSets = Array.isArray(batchResult) ? batchResult : (batchResult.sets || []);
      
      allSets = [...allSets, ...parsedSets];
      
      parsedSets.forEach((set: any) => {
        set.questions?.forEach((q: any) => {
          previousQuestionsSummaries.push(q.question);
        });
      });

      remainingSets -= setsToGenerate;
      currentStartIndex += setsToGenerate;

      // Sleep for 3 seconds between batches to avoid Groq Free Tier Rate Limits (TPM/RPM)
      if (remainingSets > 0) {
        await sleep(3000);
      }
    }

    return { sets: allSets };
  } catch (error) {
    console.error("Groq Generation Error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate questions via Groq API");
  }
};
