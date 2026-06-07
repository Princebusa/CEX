import {subscriber} from "redis";
import { rooms } from "./index";

subscriber.on("pmessage", (pattern, channel, message) => {
    console.log(`Received message from channel ${channel}: ${message}`);
  
    const data = JSON.parse(message);
    const parts = channel.split(":");
    const symbol = parts[1];
    if (!symbol) return;
  
    let type = "TRADE";
    if (channel.startsWith("orderbook_stream")) {
      type = "ORDERBOOK";
    }
  
    brodcast(symbol, type, data);
  });
  
  await subscriber.psubscribe("trades_stream:*", "orderbook_stream:*");
  
  function brodcast(symbol: string, type: string, data: any) {
    const sockets = rooms.get(symbol);
    if (sockets) {
      const payload = JSON.stringify({ type, symbol, data });
      sockets.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      });
    }
  }