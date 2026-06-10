import { Router } from "express";
import { authMiddleware } from "../Middleware/auth.middleware";
import orderController from "../Controllers/order.controller";
import { getOrders, getOrderById } from "../Controllers/orders.controller";
import { cancelOrder } from "../Controllers/cancel.controller";

const router = Router();

router.post("/order", authMiddleware, orderController);
router.get("/orders", authMiddleware, getOrders);
router.post("/orders/:orderId/cancel", authMiddleware, cancelOrder);
router.get("/orders/:orderId", authMiddleware, getOrderById);

export default router;