import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order, Position } from "@/api/types";
import {
  calcPositionMetrics,
  formatPnl,
  pnlColorClass,
  resolveMarkPrice,
} from "@/lib/positionMetrics";

type Props = {
  positions: Position[];
  orders: Order[];
  markPrice?: number | null;
  actionLoading?: string | null;
  onCancelOrder?: (orderId: string) => void;
  onExitPosition?: (position: Position) => void;
};

function orderRemaining(o: Order) {
  return o.remainingQty ?? o.qty - (o.filledQty ?? 0);
}

function positionLabel(side: string) {
  return side === "sell" ? "short" : "long";
}

export function BottomPanel({
  positions,
  orders,
  markPrice,
  actionLoading,
  onCancelOrder,
  onExitPosition,
}: Props) {
  const [active, setActive] = useState("positions");

  const tabs = [
    { id: "positions", label: `Holdings (${positions.length})` },
    { id: "orders", label: `Open Orders (${orders.length})` },
  ];

  return (
    <div className="flex h-full flex-col border-t border-border bg-card">
      <div className="border-b border-border px-6 py-3">
        <Tabs tabs={tabs} active={active} onChange={setActive} />
      </div>

      <div className="flex-1 overflow-auto px-6 py-3">
        {active === "positions" && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2.5">Symbol</th>
                <th className="px-2 py-2.5">Side</th>
                <th className="px-2 py-2.5">Qty</th>
                <th className="px-2 py-2.5">Avg</th>
                <th className="px-2 py-2.5">LTP</th>
                <th className="px-2 py-2.5">Mkt Value</th>
                <th className="px-2 py-2.5">P/L</th>
                <th className="px-2 py-2.5">P/L %</th>
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const ltp = resolveMarkPrice(markPrice ?? null, p);
                const { marketValue, unrealizedPnl, unrealizedPnlPct } =
                  calcPositionMetrics(p, ltp);
                const loading = actionLoading === `exit-${p.id}`;

                return (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-2 font-medium">{p.symbol}</td>
                    <td className="py-2">
                      <Badge variant={p.side === "buy" ? "buy" : "sell"}>
                        {positionLabel(p.side)}
                      </Badge>
                    </td>
                    <td className="py-2 tabular-nums">{p.qty}</td>
                    <td className="py-2 tabular-nums">{p.price.toFixed(2)}</td>
                    <td className="py-2 tabular-nums">
                      {ltp != null ? ltp.toFixed(2) : "—"}
                    </td>
                    <td className="py-2 tabular-nums">{marketValue.toFixed(2)}</td>
                    <td
                      className={`py-2 tabular-nums font-medium ${pnlColorClass(unrealizedPnl)}`}
                    >
                      {formatPnl(unrealizedPnl)}
                    </td>
                    <td
                      className={`py-2 tabular-nums ${pnlColorClass(unrealizedPnl)}`}
                    >
                      {formatPnl(unrealizedPnlPct)}%
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={loading}
                        onClick={() => onExitPosition?.(p)}
                      >
                        {loading ? "Exiting…" : "Exit"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {positions.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-muted-foreground">
                    No holdings — filled trades appear here (long or short)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {active === "orders" && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2.5">Symbol</th>
                <th className="px-2 py-2.5">Side</th>
                <th className="px-2 py-2.5">Type</th>
                <th className="px-2 py-2.5">Filled</th>
                <th className="px-2 py-2.5">Remaining</th>
                <th className="px-2 py-2.5">Price</th>
                <th className="px-2 py-2.5">Status</th>
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const filled = o.filledQty ?? 0;
                const remaining = orderRemaining(o);
                const loading = actionLoading === `cancel-${o.orderId}`;

                return (
                  <tr key={o.orderId} className="border-b border-border/50">
                    <td className="py-2 font-medium">{o.symbol}</td>
                    <td className="py-2">
                      <Badge variant={o.side === "buy" ? "buy" : "sell"}>{o.side}</Badge>
                    </td>
                    <td className="py-2">{o.type}</td>
                    <td className="py-2 tabular-nums">{filled}</td>
                    <td className="py-2 tabular-nums">{remaining}</td>
                    <td className="py-2 tabular-nums">{o.price.toFixed(2)}</td>
                    <td className="py-2">
                      <Badge variant="outline">{o.status}</Badge>
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        disabled={loading}
                        onClick={() => onCancelOrder?.(o.orderId)}
                      >
                        {loading ? "…" : "Cancel"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    No open orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
