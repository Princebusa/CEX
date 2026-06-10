import type { Request, Response } from "express";
import { prisma } from "db";
import { calcPositionMetrics, getMarkPrice } from "../lib/positionMetrics";

export async function getPortfolio(req: Request, res: Response) {
  try {
    const userId = String(req.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        position: {
          include: {
            market: {
              select: { symbol: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const balance = user.wallet?.balance ?? 0;

    const markPrices = new Map<string, number | null>();
    for (const symbol of new Set(user.position.map((p) => p.market.symbol))) {
      markPrices.set(symbol, await getMarkPrice(symbol));
    }

    let totalPositionValue = 0;
    let totalUnrealizedPnl = 0;

    const positions = user.position
      .filter((p) => p.qty > 0)
      .map((p) => {
        const markPrice = markPrices.get(p.market.symbol) ?? null;
        const metrics = calcPositionMetrics(p, markPrice);
        totalPositionValue += metrics.marketValue;
        totalUnrealizedPnl += metrics.unrealizedPnl;

        return {
          id: p.id,
          symbol: p.market.symbol,
          side: p.side,
          qty: p.qty,
          price: p.price,
          value: metrics.marketValue,
          ...metrics,
        };
      });

    return res.json({
      balance,
      positions,
      totalPositionValue,
      totalUnrealizedPnl,
      totalPortfolioValue: balance + totalPositionValue,
    });
  } catch (err) {
    console.error("Portfolio error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
