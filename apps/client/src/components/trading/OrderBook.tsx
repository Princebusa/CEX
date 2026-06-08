import type { OrderBookSnapshot } from "@/api/types";

type Props = {
  orderbook: OrderBookSnapshot | null;
};

function BookRow({
  price,
  qty,
  side,
}: {
  price: number;
  qty: number;
  side: "ask" | "bid";
}) {
  const isAsk = side === "ask";

  return (
    <div
      className={`relative grid grid-cols-3 gap-2 px-3 py-0.5 ${
        isAsk ? "text-red-400" : "text-emerald-400"
      }`}
    >
      <div
        className={`absolute inset-y-0 right-0 ${isAsk ? "bg-red-500/10" : "bg-emerald-500/10"}`}
        style={{ width: `${Math.min((qty / 100) * 100, 100)}%` }}
      />
      <span className="relative">{price.toFixed(2)}</span>
      <span className="relative text-right">{qty}</span>
      <span className="relative text-right">{(price * qty).toFixed(2)}</span>
    </div>
  );
}

export function OrderBook({ orderbook }: Props) {
  const asks = orderbook?.asks ?? [];
  const bids = orderbook?.bids ?? [];
  const bestBid = bids[0]?.price;
  const bestAsk = asks[0]?.price;
  const mid =
    bestBid != null && bestAsk != null
      ? ((bestBid + bestAsk) / 2).toFixed(2)
      : bestBid != null
        ? bestBid.toFixed(2)
        : bestAsk != null
          ? bestAsk.toFixed(2)
          : "—";

  const colHeader = (
    <div className="grid grid-cols-3 gap-2 border-b border-border px-3 py-1 text-muted-foreground">
      <span>Price</span>
      <span className="text-right">Qty</span>
      <span className="text-right">Total</span>
    </div>
  );

  return (
    <div className="flex h-full flex-col text-xs font-mono">
      <div className="border-b border-border px-3 py-2 text-sm font-sans font-medium">
        Order Book
      </div>

      {/* Asks (sell) — top half */}
      <div className="flex min-h-0 flex-1 flex-col border-b border-border">
        <div className="bg-red-500/10 px-3 py-1 text-[10px] font-sans font-medium uppercase tracking-wide text-red-400">
          Asks · Sell ({asks.length})
        </div>
        {colHeader}
        <div className="min-h-0 flex-1 overflow-auto">
          {asks.length === 0 ? (
            <p className="p-3 text-center text-muted-foreground">No sell orders</p>
          ) : (
            [...asks].reverse().map((ask, i) => (
              <BookRow key={`ask-${ask.orderId ?? i}`} price={ask.price} qty={ask.qty} side="ask" />
            ))
          )}
        </div>
      </div>

      {/* Spread / mid */}
      <div className="shrink-0 border-b border-border bg-muted/30 px-3 py-1.5 text-center text-sm font-sans">
        {mid}
      </div>

      {/* Bids (buy) — bottom half */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="bg-emerald-500/10 px-3 py-1 text-[10px] font-sans font-medium uppercase tracking-wide text-emerald-400">
          Bids · Buy ({bids.length})
        </div>
        {colHeader}
        <div className="min-h-0 flex-1 overflow-auto">
          {bids.length === 0 ? (
            <p className="p-3 text-center text-muted-foreground">No buy orders</p>
          ) : (
            bids.map((bid, i) => (
              <BookRow key={`bid-${bid.orderId ?? i}`} price={bid.price} qty={bid.qty} side="bid" />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
