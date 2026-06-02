import { Router } from "express";
import { authMiddleware } from "../Middleware/auth.middleware";
import orderController from "../Controllers/order.controller";

const router = Router();

router.post("/order", authMiddleware, orderController)



export default router;