import type { Request, Response } from "express";
import { prisma } from "db";
import { redisStream } from "redis";
import { availableLiquidity, getOrderbookSnapshot } from "../lib/orderbookCache";

export async function exitPosition(req: Request, res: Response) {
  try {
    const userId = String(req.userId);
    const symbol = String(req.params.symbol);
    const positionId = req.body?.positionId as string | undefined;

    const positions = await prisma.position.findMany({
      where: {
        userId,
        qty: { gt: 0 },
        market: { symbol: { equals: symbol, mode: "insensitive" } },
        ...(positionId ? { id: positionId } : {}),
      },
      include: { market: { select: { symbol: true } } },
    });

    if (!positions.length) {
      return res.status(404).json({ error: "No open position for this symbol" });
    }

    const position = positions[0]!;
    const exitSide = position.side === "buy" ? "sell" : "buy";
    const snapshot = await getOrderbookSnapshot(symbol);
    const liquidity = availableLiquidity(snapshot, exitSide);

    if (liquidity < position.qty) {
      return res.status(400).json({
        error: `Not enough liquidity to exit. Available on book: ${liquidity}, position size: ${position.qty}`,
        availableLiquidity: liquidity,
        requiredQty: position.qty,
      });
    }

    const order = {
      orderId: crypto.randomUUID(),
      userId,
      symbol: position.market.symbol,
      side: exitSide,
      type: "market" as const,
      price: 0,
      qty: position.qty,
      status: "pending",
      timestamp: Date.now(),
    };

    await prisma.order.create({
      data: {
        id: order.orderId,
        userId,
        symbol: order.symbol,
        side: exitSide,
        type: "market",
        price: 0,
        qty: position.qty,
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
      message: "Exit order placed",
      orderId: order.orderId,
      side: exitSide,
      qty: position.qty,
      symbol: order.symbol,
    });
  } catch (err) {
    console.error("Exit position error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
