import type { Request, Response } from "express";
import { orderSchema } from "comman";
import { v4 as uuidv4 } from "uuid";
import Redis from "ioredis";
import { prisma } from "db";

const redis = new Redis();

export default async function orderController(req: Request, res: Response) {
  try {
    const parseResult = orderSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error });
    }
    const { side, type, qty, price, symbol } = parseResult.data;

    if (side === "buy") {

    const orderValue = qty * price;

    const user = await prisma.user.findUnique({
      where: { id: String(req.userId) },
      include: { wallet: true }
    });

    const wallet = user?.wallet as any;

    if (wallet?.balance < orderValue) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    }
    const order = {
      orderId: uuidv4(),
      userId: String(req.userId),
      symbol,
      side,
      type: type,
      price: price || 0,
      qty,
      timestamp: Date.now()
    };

    await redis.xadd("orders_stream", "*", "data", JSON.stringify(order));

    return res.json({
      message: "Order placed",
      orderId: order.orderId
    });

  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }

}