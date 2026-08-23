import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/api/client";
import type { Order, Position } from "@/api/types";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { PriceChart } from "@/components/trading/PriceChart";
import { OrderBook } from "@/components/trading/OrderBook";
import { OrderPanel } from "@/components/trading/OrderPanel";
import { BottomPanel } from "@/components/trading/BottomPanel";
import { Badge } from "@/components/ui/badge";
import { getLiveMarkPrice } from "@/lib/positionMetrics";
import {
  toastError,
  toastExitPlaced,
  toastOrderUpdate,
} from "@/lib/toast";

export function MarketPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const { token } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (!symbol) return;

    api.getPositionBySymbol(symbol).then((res) => {
      setPositions(res.positions);
    }).catch(() => setPositions([]));

    api.getOrders(symbol, true).then((res) => {
      setOrders(res.orders);
    }).catch(() => setOrders([]));
  }, [symbol]);

  const handleOrderUpdate = useCallback(
    (
      update: {
        orderId: string;
        symbol: string;
        status: string;
        filledQty: number;
        qty: number;
      },
      isLive: boolean
    ) => {
      if (isLive) {
        toastOrderUpdate(update);
      }
      if (symbol && update.symbol.toLowerCase() === symbol.toLowerCase()) {
        loadData();
      }
    },
    [symbol, loadData]
  );

  const { orderbook, trades, connected } = useWebSocket(
    token,
    symbol ?? null,
    handleOrderUpdate
  );
  const markPrice = getLiveMarkPrice(trades);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    if (trades.length > 0) {
      loadData();
      const t1 = setTimeout(loadData, 500);
      const t2 = setTimeout(loadData, 1500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [trades.length, loadData]);

  async function handleCancelOrder(orderId: string) {
    setActionLoading(`cancel-${orderId}`);
    try {
      await api.cancelOrder(orderId);
      loadData();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleExitPosition(position: Position) {
    setActionLoading(`exit-${position.id}`);
    try {
      const res = await api.exitPosition(position.symbol, position.id);
      toastExitPlaced(res.symbol, res.side, res.qty);
      loadData();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to exit position");
    } finally {
      setActionLoading(null);
    }
  }

  if (!symbol) {
    return <div className="p-8 text-red-500">Invalid market</div>;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col border-x border-border">
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight text-foreground capitalize">{symbol}</span>
          <Badge variant={connected ? "live" : "outline"}>
            {connected ? "● Live" : "Connecting…"}
          </Badge>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 justify-between">
        <div className="hidden max-w-[320px] w-full border-r border-border lg:block">
          <OrderBook orderbook={orderbook} />
        </div>

        <div className="flex w-full min-h-0 flex-col border-0 border-border">
          <div className="min-h-0 flex-1 bg-white flex items-center justify-center">
            {/* <PriceChart trades={trades} symbol={symbol} /> */}
           <p className="text-sm text-gray-500 capitalize center">price chart coming soon</p>

          </div>
        </div>

        <div className="min-h-[400px] max-w-[320px] w-full lg:min-h-0">
          <OrderPanel symbol={symbol} onOrderPlaced={loadData} />
        </div>
      </div>

      <div className="h-56 shrink-0">
        <BottomPanel
          positions={positions}
          orders={orders}
          markPrice={markPrice}
          actionLoading={actionLoading}
          onCancelOrder={handleCancelOrder}
          onExitPosition={handleExitPosition}
        />
      </div>
    </div>
  );
}
