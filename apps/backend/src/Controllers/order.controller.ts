import type { Request, Response } from "express";
import { orderSchema } from "comman";
import { redisStream } from "redis";
import { prisma } from "db";

export default async function orderController(req: Request, res: Response) {
  try {
    const parseResult = orderSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error });
    }

    const { side, type, qty, price, symbol } = parseResult.data;
    const userId = String(req.userId);

    if (side === "buy" && type === "limit" && price) {
      const orderValue = qty * price;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      });

      const wallet = user?.wallet;

      if (!wallet || wallet.balance < orderValue) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
    }

    // if (side === "sell") {
    //   const market = await prisma.market.findFirst({
    //     where: { symbol },
    //   });

    //   if (!market) {
    //     return res.status(400).json({ error: `Unknown symbol: ${symbol}` });
    //   }

    //   const position = await prisma.position.findFirst({
    //     where: {
    //       userId,
    //       marketId: market.id,
    //       side: "buy",
    //     },
    //   });

    //   if (!position || position.qty < qty) {
    //     return res.status(400).json({ error: "Insufficient position" });
    //   }
    // }

    const order = {
      orderId: crypto.randomUUID(),
      userId,
      symbol,
      side,
      type,
      price: price ?? 0,
      qty,
      status: "pending",
      timestamp: Date.now(),
    };

    await prisma.order.create({
      data: {
        id: order.orderId,
        userId,
        symbol,
        side,
        type,
        price: order.price,
        qty,
        status: "pending",
      },
    });

    await redisStream.xadd(
      "orders_stream",
      "*",
      "data",
      JSON.stringify({ type: "order", order })
    );

    return res.json({
      message: "Order placed",
      orderId: order.orderId,
      symbol,
    });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "Internal error" });
  }
}
