import { Router } from "express";
import { getSubjects, createSubject } from "../controllers/subjectController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getSubjects);
router.post("/", authenticate, createSubject);

export default router;
