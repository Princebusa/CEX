import { Router } from "express";
import { authMiddleware } from "../Middleware/auth.middleware";
import { getPositions, getPositionBySymbol } from "../Controllers/positions.controller";
import { exitPosition } from "../Controllers/exit.controller";

const router = Router();

router.get("/positions", authMiddleware, getPositions);
router.post("/positions/:symbol/exit", authMiddleware, exitPosition);
router.get("/positions/:symbol", authMiddleware, getPositionBySymbol);

export default router;
