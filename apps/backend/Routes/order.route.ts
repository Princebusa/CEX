import { Router } from "express";
import { authMiddleware } from "../Middleware/auth.middleware";
import * as orderController from "../Controllers/order.controller";

const router = Router();

router.post("/buy", authMiddleware, orderController.buycontroller)

router.post("/sell", authMiddleware, orderController.sellcontroller)

export default router;