# Order Persister Consumer

Reads from `orders_stream` (separate consumer group from the engine) and persists orders to Postgres.

This keeps `POST /order` fast — the API only publishes to Redis; DB writes happen here asynchronously.

## Run

```bash
bun run index.ts
```

Requires `DATABASE_URL` and `REDIS_URL` in `.env`.
