import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import jwt from "jsonwebtoken";


interface WsMessage {
  method: "SUBSCRIBE" | "UNSUBSCRIBE" | "AUTH";
  symbol?: string;
  token?: string;
}
 const sockets = new Map<string, WebSocket>();

export const rooms = new Map<string, Set<WebSocket>>();


export const initwebsocket = (httpserver: Server) => {
  const wss = new WebSocketServer({ server: httpserver });

  wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", (data: string) => {
      const message = JSON.parse(data.toString()) as WsMessage;

      if (message.method === "AUTH" && message.token) {
       try{
         const decoded = jwt.verify(
          message.token,
          process.env.JWT_SECRET as string,
        ) as { userId: string };
        if (decoded && decoded.userId) {
          const myUserId = decoded.userId;
          sockets.set(myUserId, ws);
          ws.send(JSON.stringify({ type: "AUTH_SUCCESS" }));
        }else{
          ws.send(JSON.stringify({ type: "AUTH_FAILURE", error: "Invalid token" }));
        }
       }catch(err){
        ws.send(JSON.stringify({ type: "AUTH_FAILURE", error: "Invalid token" }));
       }
      }

      if (message.method === "SUBSCRIBE") {
        if (message.symbol) {
          ws.send(JSON.stringify({ type: "SUBSCRIBE_SUCCESS", symbol: message.symbol }));
          if (!rooms.has(message.symbol)) {
            rooms.set(message.symbol, new Set([ws]));
          } else {
            rooms.get(message.symbol)?.add(ws);
          }
          
        }
      
     
      }

      if (message.method === "UNSUBSCRIBE") {
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



