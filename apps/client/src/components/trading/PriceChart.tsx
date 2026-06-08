import type { LiveTrade } from "@/api/types";

type Props = {
  trades: LiveTrade[];
  symbol: string;
};

export function PriceChart({ trades, symbol }: Props) {
  const prices = trades.map((t) => t.price).reverse();
  const lastPrice = trades[0]?.price;
  const firstPrice = prices[0];
  const change = lastPrice && firstPrice ? lastPrice - firstPrice : 0;
  const changePct = firstPrice ? (change / firstPrice) * 100 : 0;
  const isUp = change >= 0;

  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;
  const range = max - min || 1;

  const points = prices
    .map((p, i) => {
      const x = prices.length > 1 ? (i / (prices.length - 1)) * 100 : 50;
      const y = 100 - ((p - min) / range) * 80 - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-end justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">{symbol}</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold tabular-nums">
              {lastPrice ? lastPrice.toFixed(2) : "—"}
            </span>
            {prices.length > 1 && (
              <span className={isUp ? "text-emerald-500" : "text-red-500"}>
                {isUp ? "+" : ""}
                {change.toFixed(2)} ({changePct.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex-1 bg-muted/10 p-4">
        {prices.length > 1 ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <polyline
              fill="none"
              stroke={isUp ? "#10b981" : "#ef4444"}
              strokeWidth="0.5"
              points={points}
            />
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Chart will appear when trades execute
          </div>
        )}
      </div>
    </div>
  );
}
