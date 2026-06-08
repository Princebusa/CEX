import { useEffect, useState } from "react";
import { api } from "@/api/client";
import type { Order, Portfolio, TradeHistory } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<TradeHistory[]>([]);
  const [active, setActive] = useState("orders");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getPortfolio(), api.getOrders(), api.getHistory()])
      .then(([p, o, h]) => {
        setPortfolio(p);
        setOrders(o.orders.filter((order) => order.status === "pending"));
        setHistory(h.history);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading portfolio...</div>;
  }

  const tabs = [
    { id: "orders", label: `Open Orders (${orders.length})` },
    { id: "history", label: `Trade History (${history.length})` },
    { id: "positions", label: `Positions (${portfolio?.positions.length ?? 0})` },
  ];

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Portfolio</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              ${portfolio?.balance.toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Positions Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              ${portfolio?.totalPositionValue.toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              ${portfolio?.totalPortfolioValue.toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Tabs tabs={tabs} active={active} onChange={setActive} />
        </CardHeader>
        <CardContent>
          {active === "orders" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2">Side</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Status</th>
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

          {active === "history" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2">Side</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Entry</th>
                  <th className="pb-2">Exit</th>
                  <th className="pb-2">PnL</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-border/50">
                    <td className="py-2">
                      <Badge variant={h.side === "buy" ? "buy" : "sell"}>{h.side}</Badge>
                    </td>
                    <td className="py-2 tabular-nums">{h.qty}</td>
                    <td className="py-2 tabular-nums">{h.price.toFixed(2)}</td>
                    <td className="py-2 tabular-nums">{h.exitPrice.toFixed(2)}</td>
                    <td
                      className={`py-2 tabular-nums ${h.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {h.pnl >= 0 ? "+" : ""}
                      {h.pnl.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No trade history
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {active === "positions" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2">Side</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Avg Price</th>
                  <th className="pb-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {portfolio?.positions.map((p) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-2 font-medium">{p.symbol}</td>
                    <td className="py-2">
                      <Badge variant={p.side === "buy" ? "buy" : "sell"}>{p.side}</Badge>
                    </td>
                    <td className="py-2 tabular-nums">{p.qty}</td>
                    <td className="py-2 tabular-nums">{p.price.toFixed(2)}</td>
                    <td className="py-2 tabular-nums">{(p.value ?? p.qty * p.price).toFixed(2)}</td>
                  </tr>
                ))}
                {(!portfolio?.positions || portfolio.positions.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No positions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
