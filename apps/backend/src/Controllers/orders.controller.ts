import type { Request, Response } from "express";
import { prisma } from "db";

function formatOrder(order: {
  id: string;
  userId: string;
  symbol: string;
  side: string;
  type: string;
  price: number;
  qty: number;
  filledQty: number;
  status: string;
  createdAt: Date;
}) {
  return {
    orderId: order.id,
    userId: order.userId,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    price: order.price,
    qty: order.qty,
    filledQty: order.filledQty,
    remainingQty: order.qty - order.filledQty,
    status: order.status,
    timestamp: order.createdAt.getTime(),
  };
}

const OPEN_STATUSES = ["pending", "open", "partially_filled"] as const;

export async function getOrders(req: Request, res: Response) {
  try {
    const userId = String(req.userId);
    const symbol = req.query.symbol ? String(req.query.symbol) : undefined;
    const openOnly = req.query.open === "true";

    const orders = await prisma.order.findMany({
      where: {
        userId,
        ...(symbol ? { symbol } : {}),
        ...(openOnly
          ? {
              OR: [
                {
                  type: "limit",
                  status: { in: [...OPEN_STATUSES] },
                },
                { type: "market", status: "pending" },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ orders: orders.map(formatOrder) });
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const userId = String(req.userId);
    const orderId = String(req.params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({ order: formatOrder(order) });
  } catch (err) {
    console.error("Get order error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
