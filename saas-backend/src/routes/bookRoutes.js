"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookController_1 = require("../controllers/bookController");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/upload", auth_1.authenticate, upload_1.upload.single("file"), bookController_1.uploadBook);
router.get("/", auth_1.authenticate, bookController_1.getBooks);
exports.default = router;
//# sourceMappingURL=bookRoutes.js.map