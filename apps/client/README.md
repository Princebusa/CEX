# Client (Vite + React)

```bash
bun install
bun run dev
```

App runs at http://localhost:4000.

## Environment

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

On Vercel, set the same vars to your deployed backend (`https://...` / `wss://...`).

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Vite dev server |
| `build` | Production build → `dist/` |
| `preview` | Preview production build |
