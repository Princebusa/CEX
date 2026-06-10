import { Router } from "express";
import { authMiddleware } from "../Middleware/auth.middleware";
import { getHistory } from "../Controllers/history.controller";

const router = Router();

router.get("/history", authMiddleware, getHistory);

export default router;
