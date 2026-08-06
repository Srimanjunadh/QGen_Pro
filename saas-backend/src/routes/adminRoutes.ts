import { Router } from "express";
import { generateCodes, getStudents, updateStudentStatus, publishExam, getExamStats } from "../controllers/adminController";

const router = Router();

router.post("/generate-codes", generateCodes);
router.get("/students", getStudents);
router.put("/students/:id/status", updateStudentStatus);
router.post("/papers/:paperId/publish", publishExam);
router.get("/exam-stats/:paperId", getExamStats);

export default router;
