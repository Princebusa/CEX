import { OrderBook } from "./orderBook";

const engines: { key: string } = {};

export function getEngine(symbol: string) {
  if (!engines[symbol]) {
    console.log("Creating engine for:", symbol);
    engines[symbol] = new OrderBook(symbol);
  }
  return engines[symbol];
}

export async function startEngine(symbol: string) {
  let lastId = "0";

  while (true) {
    const response = await redis.xread(
      "BLOCK",
      0,
      "STREAMS",
      `orders_stream:${symbol}`,
      lastId
    );

    if (!response) continue;

    const [_, messages] = response[0];

    for (const [id, fields] of messages) {
      lastId = id;

      const order = JSON.parse(fields[1]);
      await engines[symbol].process(order);
    }
  }
}