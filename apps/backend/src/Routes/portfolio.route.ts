import { Router } from "express";
import { authMiddleware } from "../Middleware/auth.middleware";
import { getPortfolio } from "../Controllers/portfolio.controller";

const router = Router();

router.get("/portfolio", authMiddleware, getPortfolio);

export default router;
