import { Router } from "express";
import { uploadBook, getBooks } from "../controllers/bookController";
import { upload } from "../middleware/upload";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/upload", authenticate, upload.single("file"), uploadBook);
router.get("/", authenticate, getBooks);

export default router;
