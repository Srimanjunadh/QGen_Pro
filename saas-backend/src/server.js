"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const bookRoutes_1 = __importDefault(require("./routes/bookRoutes"));
const subjectRoutes_1 = __importDefault(require("./routes/subjectRoutes"));
const paperRoutes_1 = __importDefault(require("./routes/paperRoutes"));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/books", bookRoutes_1.default);
app.use("/api/subjects", subjectRoutes_1.default);
app.use("/api/papers", paperRoutes_1.default);
app.get("/", (req, res) => {
    res.send("SaaS Backend is running!");
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map