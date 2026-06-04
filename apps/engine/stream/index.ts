import redis from 'redis';

export async function emitOrderbook(symbol: string, bids: any[], asks: any[]): Promise<any> {
  const snapshot = {
    symbol,
    bids: bids.slice(0, 10),
    asks: asks.slice(0, 10)
  };

  await redis.xadd(
    `orderbook_stream:${symbol}`,
    "*",
    "data",
    JSON.stringify(snapshot)
  );
}

export async function emitTrade(buy: any, sell: any, qty: number, price: number, symbol: string): Promise<any> {
  const trade = {
    symbol,
    tradeId: Date.now(),
    price,
    quantity: qty,
    timestamp: Date.now()
  };

  await redis.xadd(`trades_stream:${symbol}`, "*", "data", JSON.stringify(trade));
}