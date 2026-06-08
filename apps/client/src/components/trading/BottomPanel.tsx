import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { LiveTrade, Order, Position } from "@/api/types";

type Props = {
  positions: Position[];
  orders: Order[];
  trades: LiveTrade[];
};

export function BottomPanel({ positions, orders, trades }: Props) {
  const [active, setActive] = useState("positions");

  const tabs = [
    { id: "positions", label: `Positions (${positions.length})` },
    { id: "orders", label: `Open Orders (${orders.length})` },
    { id: "trades", label: `Live Trades (${trades.length})` },
  ];

  return (
    <div className="flex h-full flex-col border-t border-border bg-card">
      <Tabs tabs={tabs} active={active} onChange={setActive} className="px-4" />

      <div className="flex-1 overflow-auto p-4">
        {active === "positions" && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Symbol</th>
                <th className="pb-2 font-medium">Side</th>
                <th className="pb-2 font-medium">Qty</th>
                <th className="pb-2 font-medium">Avg Price</th>
                <th className="pb-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-2 font-medium">{p.symbol}</td>
                  <td className="py-2">
                    <Badge variant={p.side === "buy" ? "buy" : "sell"}>{p.side}</Badge>
                  </td>
                  <td className="py-2 tabular-nums">{p.qty}</td>
                  <td className="py-2 tabular-nums">{p.price.toFixed(2)}</td>
                  <td className="py-2 tabular-nums">{(p.qty * p.price).toFixed(2)}</td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No open positions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {active === "orders" && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Symbol</th>
                <th className="pb-2 font-medium">Side</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Qty</th>
                <th className="pb-2 font-medium">Price</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId} className="border-b border-border/50">
                  <td className="py-2 font-medium">{o.symbol}</td>
                  <td className="py-2">
                    <Badge variant={o.side === "buy" ? "buy" : "sell"}>{o.side}</Badge>
                  </td>
                  <td className="py-2">{o.type}</td>
                  <td className="py-2 tabular-nums">{o.qty}</td>
                  <td className="py-2 tabular-nums">{o.price.toFixed(2)}</td>
                  <td className="py-2">
                    <Badge variant="outline">{o.status}</Badge>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    No open orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {active === "trades" && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Price</th>
                <th className="pb-2 font-medium">Quantity</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.tradeId} className="border-b border-border/50">
                  <td className="py-2 tabular-nums text-emerald-500">{t.price.toFixed(2)}</td>
                  <td className="py-2 tabular-nums">{t.quantity}</td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(t.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-muted-foreground">
                    No trades yet
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
