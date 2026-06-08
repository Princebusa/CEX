import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/api/client";
import type { Order, Position } from "@/api/types";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { PriceChart } from "@/components/trading/PriceChart";
import { OrderBook } from "@/components/trading/OrderBook";
import { TradeTape } from "@/components/trading/TradeTape";
import { OrderPanel } from "@/components/trading/OrderPanel";
import { BottomPanel } from "@/components/trading/BottomPanel";
import { Badge } from "@/components/ui/badge";

export function MarketPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const { token } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const { orderbook, trades, connected } = useWebSocket(token, symbol ?? null);

  const loadData = useCallback(() => {
    if (!symbol) return;

    api.getPositionBySymbol(symbol).then((res) => {
      setPositions(res.positions);
    }).catch(() => setPositions([]));

    api.getOrders().then((res) => {
      const open = res.orders.filter(
        (o) => o.symbol === symbol && o.status === "pending"
      );
      setOrders(open);
    }).catch(() => setOrders([]));
  }, [symbol]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!symbol) {
    return <div className="p-8 text-red-500">Invalid market</div>;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className="font-semibold">{symbol}</span>
        <Badge variant={connected ? "buy" : "outline"}>
          {connected ? "Live" : "Connecting..."}
        </Badge>
      </div>

      <div className="flex justify-between min-h-0 ">
      <div className="hidden border-x border-border lg:block max-w-[320px] w-full">
          <OrderBook orderbook={orderbook} />
        </div>
        <div className="flex min-h-0 flex-col border-0 border-border w-full">
          <div className="min-h-0 flex-1">
            <PriceChart trades={trades} symbol={symbol} />
          </div>
         
        </div>

       

        <div className="min-h-[400px] lg:min-h-0 max-w-[320px] w-full">
          <OrderPanel symbol={symbol} onOrderPlaced={loadData} />
        </div>
      </div>

      <div className="h-56 shrink-0">
        <BottomPanel positions={positions} orders={orders} trades={trades} />
      </div>
    </div>
  );
}
