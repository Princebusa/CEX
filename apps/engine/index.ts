import dotenv from "dotenv";
import redis from "redis";
import type { order } from "comman";
import { OrderBook } from "./orderBook";

dotenv.config();

const STREAM = "orders_stream";
const GROUP = "engine_group";
const CONSUMER = `consumer-${process.pid}`;

const orderbooks: Record<string, OrderBook> = {};

async function init() {
  try {
    await redis.xgroup("CREATE", STREAM, GROUP, "0", "MKSTREAM");
  } catch (err: unknown) {
      throw err;
  }
}

function getOrderBook(symbol: string): OrderBook {
  if (!orderbooks[symbol]) {
    orderbooks[symbol] = new OrderBook(symbol);
    console.log(`Order book created for ${symbol}`);
  }
  return orderbooks[symbol];
}

function parseOrder(fields: string[]): order {
  const raw = JSON.parse(fields[1]!);
  const order = raw.order ?? raw;

  if (!order.symbol) {
    throw new Error("Order missing symbol");
  }

  return order as order;
}

async function start() {
  await init();


  while (true) {
    try {
      const res = (await redis.xreadgroup(
        "GROUP",
        GROUP,
        CONSUMER,
        "COUNT",
        10,
        "BLOCK",
        5000,
        "STREAMS",
        STREAM,
        ">"
      )) 

      if (!res) continue;
  // @ts-ignore
      for (const [, messages] of res) {
      
        for (const [id, fields] of messages) {
          try {
            const order = parseOrder(fields);
            const orderbook = getOrderBook(order.symbol);

            await orderbook.process(order);
            await redis.xack(STREAM, GROUP, id);
          } catch (err) {
            console.error("Processing error:", err);
          }
        }
      }
    } catch (err) {
      console.error("Worker loop error:", err);
    }
  }
}

start();
