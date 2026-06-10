import { publisher, redisStream } from "redis";

export async function emitOrderbook(symbol: string, bids: any[], asks: any[]) {
  const snapshot = {
    symbol,
    bids: bids.slice(0, 10),
    asks: asks.slice(0, 10),
  };

  const payload = JSON.stringify(snapshot);

  await publisher.publish(`orderbook_stream:${symbol}`, payload);
  await redisStream.set(`orderbook:${symbol.toLowerCase()}`, payload);
}

export async function emitTrade(
  buy: { orderId: string; userId: string },
  sell: { orderId: string; userId: string },
  qty: number,
  price: number,
  symbol: string
) {
  const trade = {
    symbol,
    tradeId: crypto.randomUUID(),
    buyOrderId: buy.orderId,
    sellOrderId: sell.orderId,
    buyerId: buy.userId,
    sellerId: sell.userId,
    price,
    quantity: qty,
    timestamp: Date.now(),
  };

  const payload = JSON.stringify(trade);

  await publisher.publish(`trades_stream:${symbol}`, payload);
  await redisStream.xadd("settlements_stream", "*", "data", payload);
  await redisStream.set(`last_price:${symbol.toLowerCase()}`, String(price));
}

export async function emitOrderUpdate(data: {
  orderId: string;
  userId: string;
  symbol: string;
  status: "open" | "filled" | "partially_filled" | "cancelled";
  filledQty: number;
  qty: number;
}) {
  await publisher.publish(
    "order_updates",
    JSON.stringify({ ...data, timestamp: Date.now() })
  );
}
