"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subjectController_1 = require("../controllers/subjectController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, subjectController_1.getSubjects);
router.post("/", auth_1.authenticate, subjectController_1.createSubject);
exports.default = router;
//# sourceMappingURL=subjectRoutes.js.map