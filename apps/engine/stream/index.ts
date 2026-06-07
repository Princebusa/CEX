import {publisher} from "redis";


 export async function emitOrderbook(symbol: string, bids: any[], asks: any[]): Promise<any> {
  const snapshot = {
    symbol,
    bids: bids.slice(0, 10),
    asks: asks.slice(0, 10)
  };

  await publisher.publish(
    `orderbook_stream:${symbol}`,
    JSON.stringify(snapshot)
  );
}

export async function emitTrade(
  buy: { orderId: string; userId: string },
  sell: { orderId: string; userId: string },
  qty: number,
  price: number,
  symbol: string
): Promise<void> {
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

  await publisher.publish(
    `trades_stream:${symbol}`,
    JSON.stringify(trade)
  );
}