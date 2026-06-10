import type { OrderBookSnapshot } from "@/api/types";

type Props = {
  orderbook: OrderBookSnapshot | null;
};

function BookRow({
  price,
  qty,
  side,
  maxQty,
}: {
  price: number;
  qty: number;
  side: "ask" | "bid";
  maxQty: number;
}) {
  const isAsk = side === "ask";
  const depth = maxQty > 0 ? Math.min((qty / maxQty) * 100, 100) : 0;

  return (
    <div
      className={`relative grid grid-cols-3 gap-2 px-3 py-1 text-[13px] tabular-nums ${
        isAsk ? "text-red-600" : "text-emerald-700"
      }`}
    >
      <div
        className={`absolute inset-y-0 right-0 ${isAsk ? "bg-red-50" : "bg-emerald-50"}`}
        style={{ width: `${depth}%` }}
      />
      <span className="relative font-medium">{price.toFixed(2)}</span>
      <span className="relative text-right">{qty}</span>
      <span className="relative text-right text-muted-foreground">
        {(price * qty).toFixed(2)}
      </span>
    </div>
  );
}

export function OrderBook({ orderbook }: Props) {
  const asks = orderbook?.asks ?? [];
  const bids = orderbook?.bids ?? [];
  const maxQty = Math.max(...[...asks, ...bids].map((l) => l.qty), 1);
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
    <div className="grid grid-cols-3 gap-2 border-b border-border bg-muted/40 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      <span>Price</span>
      <span className="text-right">Qty</span>
      <span className="text-right">Total</span>
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-card text-sm">
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-semibold text-foreground">Order Book</h3>
        <p className="text-xs text-muted-foreground">Live depth</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col border-b border-border">
        <div className="bg-red-50/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-red-600">
          Asks · Sell ({asks.length})
        </div>
        {colHeader}
        <div className="min-h-0 flex-1 overflow-auto">
          {asks.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No sell orders</p>
          ) : (
            [...asks].reverse().map((ask, i) => (
              <BookRow
                key={`ask-${ask.orderId ?? i}`}
                price={ask.price}
                qty={ask.qty}
                side="ask"
                maxQty={maxQty}
              />
            ))
          )}
        </div>
      </div>

      <div className="shrink-0 border-b border-border bg-muted/50 px-3 py-2 text-center">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Spread
        </span>
        <p className="text-base font-semibold tabular-nums text-foreground">{mid}</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="bg-emerald-50/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
          Bids · Buy ({bids.length})
        </div>
        {colHeader}
        <div className="min-h-0 flex-1 overflow-auto">
          {bids.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No buy orders</p>
          ) : (
            bids.map((bid, i) => (
              <BookRow
                key={`bid-${bid.orderId ?? i}`}
                price={bid.price}
                qty={bid.qty}
                side="bid"
                maxQty={maxQty}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
