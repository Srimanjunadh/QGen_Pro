import { generateQuestionsSet } from './src/utils/aiGenerator';
import dotenv from 'dotenv';
dotenv.config({ override: true });

async function test() {
  try {
    const res = await generateQuestionsSet({
      subject: "Test Subject",
      numSets: 1,
      questionsPerSet: 1,
      difficulty: { easy: 100, medium: 0, hard: 0 },
      questionTypes: ["MCQ"],
      topic: "Test Topic"
    });
    console.log("SUCCESS");
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("FAILED");
    console.error(e);
  }
}

test();
