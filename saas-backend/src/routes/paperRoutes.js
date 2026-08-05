"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paperController_1 = require("../controllers/paperController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/generate", auth_1.authenticate, paperController_1.generatePaper);
router.get("/", auth_1.authenticate, paperController_1.getPapers);
router.get("/:id", auth_1.authenticate, paperController_1.getPaperById);
exports.default = router;
//# sourceMappingURL=paperRoutes.js.map