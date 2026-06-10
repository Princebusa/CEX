import { useEffect, useRef, useState } from "react";
import { WS_URL } from "@/lib/config";
import type { LiveTrade, OrderBookSnapshot } from "@/api/types";

export type OrderUpdateMessage = {
  orderId: string;
  userId: string;
  symbol: string;
  status: string;
  filledQty: number;
  qty: number;
  timestamp?: number;
};

type WsMessage = {
  type: string;
  symbol?: string;
  data?: LiveTrade | OrderBookSnapshot | OrderUpdateMessage;
};

function safeSend(ws: WebSocket, data: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export function useWebSocket(
  token: string | null,
  symbol: string | null,
  onOrderUpdate?: (update: OrderUpdateMessage, isLive: boolean) => void
) {
  const [orderbook, setOrderbook] = useState<OrderBookSnapshot | null>(null);
  const [trades, setTrades] = useState<LiveTrade[]>([]);
  const [connected, setConnected] = useState(false);
  const onOrderUpdateRef = useRef(onOrderUpdate);
  const connectedAtRef = useRef(0);

  useEffect(() => {
    onOrderUpdateRef.current = onOrderUpdate;
  }, [onOrderUpdate]);

  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(WS_URL);
    let cancelled = false;

    ws.onopen = () => {
      if (cancelled) return;
      connectedAtRef.current = Date.now();
      setConnected(true);
      if (token) {
        safeSend(ws, { method: "AUTH", token });
      }
      safeSend(ws, { method: "SUBSCRIBE", symbol });
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data as string) as WsMessage;

      if (msg.type === "ORDERBOOK" && msg.data) {
        setOrderbook(msg.data as OrderBookSnapshot);
      }

      if (msg.type === "TRADE" && msg.data) {
        const trade = msg.data as LiveTrade;
        setTrades((prev) => [trade, ...prev].slice(0, 50));
      }

      if (msg.type === "ORDER_UPDATE" && msg.data) {
        const update = msg.data as OrderUpdateMessage;
        const isLive =
          update.timestamp != null &&
          update.timestamp >= connectedAtRef.current - 500;
        onOrderUpdateRef.current?.(update, isLive);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      cancelled = true;
      safeSend(ws, { method: "UNSUBSCRIBE", symbol });
      ws.close();
    };
  }, [token, symbol]);

  return { orderbook, trades, connected };
}
