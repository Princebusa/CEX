import { redisStream } from "redis";

type BookLevel = { price: number; qty: number };

export type OrderbookSnapshot = {
  symbol: string;
  bids: BookLevel[];
  asks: BookLevel[];
};

export async function getOrderbookSnapshot(
  symbol: string
): Promise<OrderbookSnapshot | null> {
  const raw = await redisStream.get(`orderbook:${symbol.toLowerCase()}`);
  if (!raw) return null;
  return JSON.parse(raw) as OrderbookSnapshot;
}

export function availableLiquidity(
  snapshot: OrderbookSnapshot | null,
  side: "buy" | "sell"
): number {
  if (!snapshot) return 0;
  const levels = side === "sell" ? snapshot.bids : snapshot.asks;
  return levels.reduce((sum, level) => sum + level.qty, 0);
}
