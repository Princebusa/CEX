import type { Request, Response } from "express";
import { prisma } from "db";

export async function getMarkets(req: Request, res: Response) {
  try {
    const markets = await prisma.market.findMany({
      select: {
        id: true,
        symbol: true,
      },
    });

    return res.json({ markets });
  } catch (err) {
    console.error("Market error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
