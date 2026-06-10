import type { Request, Response } from "express";
import { prisma } from "db";
import { publisher, redisStream } from "redis";

const CANCELLABLE = ["pending", "open", "partially_filled"] as const;

export async function cancelOrder(req: Request, res: Response) {
  try {
    const userId = String(req.userId);
    const orderId = String(req.params.orderId);

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!CANCELLABLE.includes(order.status as (typeof CANCELLABLE)[number])) {
      return res.status(400).json({ error: `Cannot cancel ${order.status} order` });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });

    await redisStream.set(`order_cancelled:${orderId}`, "1", "EX", 86400);

    await redisStream.xadd(
      "orders_stream",
      "*",
      "data",
      JSON.stringify({
        type: "cancel",
        orderId,
        userId,
        symbol: order.symbol,
      })
    );

    await publisher.publish(
      "order_updates",
      JSON.stringify({
        orderId,
        userId,
        symbol: order.symbol,
        status: "cancelled",
        filledQty: order.filledQty,
        qty: order.qty,
        timestamp: Date.now(),
      })
    );

    return res.json({ message: "Order cancelled", orderId });
  } catch (err) {
    console.error("Cancel order error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
