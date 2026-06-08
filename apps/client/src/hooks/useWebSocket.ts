import { useEffect, useState } from "react";
import { WS_URL } from "@/lib/config";
import type { LiveTrade, OrderBookSnapshot } from "@/api/types";

type WsMessage = {
  type: string;
  symbol?: string;
  data?: LiveTrade | OrderBookSnapshot;
};

function safeSend(ws: WebSocket, data: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export function useWebSocket(token: string | null, symbol: string | null) {
  const [orderbook, setOrderbook] = useState<OrderBookSnapshot | null>(null);
  const [trades, setTrades] = useState<LiveTrade[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(WS_URL);
    let cancelled = false;

    ws.onopen = () => {
      if (cancelled) return;
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
