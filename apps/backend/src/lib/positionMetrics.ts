import { redisStream } from "redis";

type PositionInput = {
  side: string;
  qty: number;
  price: number;
};

export async function getMarkPrice(symbol: string): Promise<number | null> {
  const raw = await redisStream.get(`last_price:${symbol.toLowerCase()}`);
  if (!raw) return null;
  const price = Number(raw);
  return Number.isFinite(price) ? price : null;
}

export function calcPositionMetrics(position: PositionInput, markPrice: number | null) {
  const mark = markPrice ?? position.price;
  const costBasis = position.price * position.qty;
  const marketValue = mark * position.qty;
  const unrealizedPnl =
    position.side === "buy" ? marketValue - costBasis : costBasis - marketValue;
  const unrealizedPnlPct = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;

  return {
    markPrice: mark,
    marketValue,
    unrealizedPnl,
    unrealizedPnlPct,
  };
}
