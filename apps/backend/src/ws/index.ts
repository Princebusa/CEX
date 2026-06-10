import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import jwt from "jsonwebtoken";
import { redisStream, subscriber } from "redis";

interface WsMessage {
  method: "SUBSCRIBE" | "UNSUBSCRIBE" | "AUTH";
  symbol?: string;
  token?: string;
}

const sockets = new Map<string, WebSocket>();
export const rooms = new Map<string, Set<WebSocket>>();
const orderbookCache = new Map<string, object>();

function sendToClient(ws: WebSocket, type: string, symbol: string, data: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, symbol, data }));
  }
}

function brodcast(symbol: string, type: string, data: unknown) {
  const clients = rooms.get(symbol);
  if (!clients) return;

  const payload = JSON.stringify({ type, symbol, data });
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

subscriber.on("pmessage", (_pattern, channel, message) => {
  const parts = channel.split(":");
  const symbol = parts[1];
  if (!symbol) return;

  let type = "TRADE";
  if (channel.startsWith("orderbook_stream")) {
    type = "ORDERBOOK";
  }

  const data = JSON.parse(message);

  if (type === "ORDERBOOK") {
    orderbookCache.set(symbol, data);
  }

  brodcast(symbol, type, data);
});

await subscriber.psubscribe("trades_stream:*", "orderbook_stream:*");

const orderUpdateSub = redisStream.duplicate();
await orderUpdateSub.subscribe("order_updates");

orderUpdateSub.on("message", (_channel, message) => {
  try {
    const update = JSON.parse(message) as {
      userId: string;
      symbol: string;
      orderId: string;
      status: string;
      filledQty: number;
      qty: number;
    };
    const ws = sockets.get(update.userId);
    if (ws) {
      sendToClient(ws, "ORDER_UPDATE", update.symbol, update);
    }
  } catch (err) {
    console.error("Order update relay error:", err);
  }
});

export const initwebsocket = (httpserver: Server) => {
  const wss = new WebSocketServer({ server: httpserver });

  wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", (data: string) => {
      const message = JSON.parse(data.toString()) as WsMessage;

      if (message.method === "AUTH" && message.token) {
        try {
          const decoded = jwt.verify(
            message.token,
            process.env.JWT_SECRET as string
          ) as { userId: string };
          sockets.set(decoded.userId, ws);
          ws.send(JSON.stringify({ type: "AUTH_SUCCESS" }));
        } catch {
          ws.send(JSON.stringify({ type: "AUTH_FAILURE", error: "Invalid token" }));
        }
      }

      if (message.method === "SUBSCRIBE" && message.symbol) {
        const symbol = message.symbol;

        if (!rooms.has(symbol)) {
          rooms.set(symbol, new Set([ws]));
        } else {
          rooms.get(symbol)?.add(ws);
        }

        ws.send(JSON.stringify({ type: "SUBSCRIBE_SUCCESS", symbol }));

        const cached = orderbookCache.get(symbol);
        if (cached) {
          sendToClient(ws, "ORDERBOOK", symbol, cached);
        } else {
          sendToClient(ws, "ORDERBOOK", symbol, {
            symbol,
            bids: [],
            asks: [],
          });
        }
      }

      if (message.method === "UNSUBSCRIBE" && message.symbol) {
        rooms.get(message.symbol)?.delete(ws);
      }
    });

    ws.on("close", () => {
      for (const [symbol, clients] of rooms) {
        clients.delete(ws);
        if (clients.size === 0) rooms.delete(symbol);
      }
      for (const [userId, socket] of sockets) {
        if (socket === ws) sockets.delete(userId);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
};
