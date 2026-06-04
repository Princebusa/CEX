import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import jwt from "jsonwebtoken";

interface WsMessage {
  method: "SUBSCRIBE" | "UNSUBSCRIBE" | "AUTH";
  symbol?: string;
  token?: string;
}

export const initwebsocket = (httpserver: Server) => {
  const wss = new WebSocketServer({ server: httpserver });

  const sockets = new Map<string, WebSocket>();

  const rooms = new Map<string, Set<WebSocket>>();

  wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", (data: string) => {
      const message = JSON.parse(data.toString()) as WsMessage;

      if (message.toString() === "AUTH" && message.token) {
        const decoded = jwt.verify(
          message.token,
          process.env.JWT_SECRET as string,
        ) as { userId: string };
        if (decoded && decoded.userId) {
          const myUserId = decoded.userId;
          sockets.set(myUserId, ws);
          ws.send(JSON.stringify({ type: "AUTH_SUCCESS" }));
        }
      }

      if (message.toString() === "SUBSCRIBE") {
        if (message.symbol) {
          if (!rooms.has(message.symbol)) {
            rooms.set(message.symbol, new Set());
          } else {
            rooms.get(message.symbol)?.add(ws);
          }
        }
      }

      if (message.toString() === "UNSUBSCRIBE") {
        if (message.symbol) {
          rooms.get(message.symbol)?.delete(ws);
        }
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
};
