import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const { redisStream } = await import("redis");
const { prisma } = await import("db");
const { startSettlement, handleTrade } = await import("./settlement");

const STREAM = "orders_stream";
const GROUP = "persister_group";
const CONSUMER = `persister-${process.pid}`;
const SETTLEMENT_STREAM = "settlements_stream";

async function init() {
  try {
    await redisStream.xgroup("CREATE", STREAM, GROUP, "0", "MKSTREAM");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("BUSYGROUP")) throw err;
  }
}

function parseOrder(fields: string[]) {
  const raw = JSON.parse(fields[1]!);
  if (raw.type === "cancel") return null;
  const data = raw.order ?? raw;
  if (!data.orderId || !data.userId || !data.symbol) {
    throw new Error("Invalid order payload");
  }
  return data;
}

async function persistOrder(data: {
  orderId: string;
  userId: string;
  symbol: string;
  side: string;
  type: string;
  price: number;
  qty: number;
  timestamp: number;
}) {
  await prisma.order.upsert({
    where: { id: data.orderId },
    create: {
      id: data.orderId,
      userId: data.userId,
      symbol: data.symbol,
      side: data.side as "buy" | "sell",
      type: data.type as "limit" | "market",
      price: data.price,
      qty: data.qty,
      status: "pending",
      createdAt: new Date(data.timestamp),
    },
    update: {},
  });
}

async function replaySettlements() {
  const entries = await redisStream.xrange(SETTLEMENT_STREAM, "-", "+");
  if (!entries.length) return;

  console.log(`Replaying ${entries.length} settlement(s) from stream...`);

  for (const [id, fields] of entries) {
    try {
      const trade = JSON.parse(fields[1]!);
      if (trade.tradeId) {
        await redisStream.del(`settled:${trade.tradeId}`);
      }
      await handleTrade(trade, { notify: false });
      console.log(`Replayed settlement ${id}`);
    } catch (err) {
      console.error(`Replay failed for ${id}:`, err);
    }
  }
}

async function start() {
  await init();
  await replaySettlements();
  await startSettlement();

  console.log("Consumer started — orders_stream + settlements_stream");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "connected" : "MISSING");

  while (true) {
    try {
      const res = (await redisStream.xreadgroup(
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
      )) as [string, [string, string[]][]][] | null;

      if (!res) continue;

      for (const [, messages] of res) {
        for (const [id, fields] of messages) {
          try {
            const order = parseOrder(fields);
            if (!order) {
              await redisStream.xack(STREAM, GROUP, id);
              continue;
            }
            await persistOrder(order);
            await redisStream.xack(STREAM, GROUP, id);
          } catch (err) {
            console.error("Persist error:", err);
          }
        }
      }
    } catch (err) {
      console.error("Consumer loop error:", err);
    }
  }
}

start();
