import { Router } from "express";
import { register, login, getAssignedExams, getExamDetails, submitExam } from "../controllers/studentController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/:studentId/exams", getAssignedExams);
router.get("/assignment/:assignmentId", getExamDetails);
router.post("/assignment/:assignmentId/submit", submitExam);

export default router;
