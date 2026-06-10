import type { LiveTrade } from "@/api/types";
import { cn } from "@/lib/utils";

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
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-end justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {symbol}
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
              {lastPrice ? lastPrice.toFixed(2) : "—"}
            </span>
            {prices.length > 1 && (
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  isUp ? "text-emerald-600" : "text-red-600"
                )}
              >
                {isUp ? "+" : ""}
                {change.toFixed(2)} ({changePct.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex-1 bg-gradient-to-b from-muted/30 to-transparent p-6">
        {prices.length > 1 ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity="0.15" />
                <stop offset="100%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              fill="url(#chartFill)"
              points={`0,100 ${points} 100,100`}
            />
            <polyline
              fill="none"
              stroke={isUp ? "#059669" : "#dc2626"}
              strokeWidth="0.6"
              points={points}
            />
          </svg>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <p className="text-sm font-medium">No trades yet</p>
            <p className="text-xs">Chart appears when trades execute</p>
          </div>
        )}
      </div>
    </div>
  );
}
