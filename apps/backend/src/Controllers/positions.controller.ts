import type { Request, Response } from "express";

import { prisma } from "db";

import { calcPositionMetrics, getMarkPrice } from "../lib/positionMetrics";



async function enrichPositions(

  positions: Array<{

    id: string;

    side: string;

    qty: number;

    price: number;

    marketId: string;

    market: { symbol: string };

  }>

) {

  const markPrices = new Map<string, number | null>();



  for (const symbol of new Set(positions.map((p) => p.market.symbol))) {

    markPrices.set(symbol, await getMarkPrice(symbol));

  }



  return positions.map((p) => {

    const markPrice = markPrices.get(p.market.symbol) ?? null;

    const metrics = calcPositionMetrics(p, markPrice);



    return {

      id: p.id,

      symbol: p.market.symbol,

      side: p.side,

      qty: p.qty,

      price: p.price,

      marketId: p.marketId,

      ...metrics,

    };

  });

}



export async function getPositions(req: Request, res: Response) {

  try {

    const userId = String(req.userId);



    const positions = await prisma.position.findMany({

      where: { userId, qty: { gt: 0 } },

      include: {

        market: {

          select: { symbol: true },

        },

      },

    });



    const result = await enrichPositions(positions);

    return res.json({ positions: result });

  } catch (err) {

    console.error("Positions error:", err);

    return res.status(500).json({ error: "Internal error" });

  }

}



export async function getPositionBySymbol(req: Request, res: Response) {

  try {

    const userId = String(req.userId);

    const symbol = String(req.params.symbol);



    const positions = await prisma.position.findMany({

      where: {

        userId,

        qty: { gt: 0 },

        market: {

          symbol: { equals: symbol, mode: "insensitive" },

        },

      },

      include: {

        market: {

          select: { symbol: true },

        },

      },

    });



    const result = await enrichPositions(positions);

    return res.json({ positions: result });

  } catch (err) {

    console.error("Position error:", err);

    return res.status(500).json({ error: "Internal error" });

  }

}

