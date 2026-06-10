import { Router } from "express";
import { authMiddleware } from "../Middleware/auth.middleware";
import { getMarkets } from "../Controllers/market.controller";

const router = Router();

router.get("/market", authMiddleware, getMarkets);

export default router;
