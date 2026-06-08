import type { LiveTrade } from "@/api/types";

type Props = {
  trades: LiveTrade[];
};

export function TradeTape({ trades }: Props) {
  return (
    <div className="flex h-full flex-col text-xs font-mono">
      <div className="border-b border-border px-3 py-2 text-sm font-sans font-medium">
        Recent Trades
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-border px-3 py-1.5 text-muted-foreground">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Time</span>
      </div>

      <div className="flex-1 overflow-auto">
        {trades.map((trade) => (
          <div key={trade.tradeId} className="grid grid-cols-3 gap-2 px-3 py-1 hover:bg-muted/30">
            <span className="text-emerald-400">{trade.price.toFixed(2)}</span>
            <span className="text-right">{trade.quantity}</span>
            <span className="text-right text-muted-foreground">
              {new Date(trade.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}

        {trades.length === 0 && (
          <p className="p-4 text-center text-muted-foreground">Waiting for trades...</p>
        )}
      </div>
    </div>
  );
}
