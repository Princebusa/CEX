import type { Request, Response } from "express";
import { prisma } from "db";

export async function getHistory(req: Request, res: Response) {
  try {
    const userId = String(req.userId);

    const history = await prisma.history.findMany({
      where: { userId },
      orderBy: { id: "desc" },
    });

    const result = history.map((h) => ({
      id: h.id,
      side: h.side,
      qty: h.qty,
      price: h.price,
      exitPrice: h.exitPrice,
      pnl: (h.exitPrice - h.price) * h.qty,
    }));

    return res.json({ history: result });
  } catch (err) {
    console.error("History error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
