import { Router } from "express";
import { generatePaper, getPapers, getPaperById } from "../controllers/paperController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/generate", authenticate, generatePaper);
router.get("/", authenticate, getPapers);
router.get("/:id", authenticate, getPaperById);

export default router;
