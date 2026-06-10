import type { LiveTrade, Position } from "@/api/types";

/** Last traded price only — never use resting limit orders from the book. */
export function getLiveMarkPrice(trades: LiveTrade[]): number | null {
  const price = trades[0]?.price;
  return price != null && Number.isFinite(price) ? price : null;
}

export function resolveMarkPrice(
  liveTradePrice: number | null,
  position: Pick<Position, "markPrice" | "price">
): number | null {
  if (liveTradePrice != null) return liveTradePrice;
  if (position.markPrice != null && Number.isFinite(position.markPrice)) {
    return position.markPrice;
  }
  return null;
}

export function calcPositionMetrics(
  position: Pick<Position, "side" | "qty" | "price">,
  markPrice: number | null
) {
  const mark = markPrice ?? position.price;
  const costBasis = position.price * position.qty;
  const marketValue = mark * position.qty;
  const unrealizedPnl =
    position.side === "buy" ? marketValue - costBasis : costBasis - marketValue;
  const unrealizedPnlPct = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;

  return { markPrice: mark, marketValue, unrealizedPnl, unrealizedPnlPct };
}

export function formatPnl(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

export function pnlColorClass(value: number) {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-red-600";
  return "text-muted-foreground";
}
