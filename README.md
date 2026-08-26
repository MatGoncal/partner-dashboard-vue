# partner-dashboard-vue

AcmePay partner dashboard — Vue 3 + TypeScript SPA for transactions, FX quotes
with rate-lock countdown, PIX payment creation (QR + polling), and multi-currency
balances.

Consumes the shared [AcmePay v1 contract](../pix-wallet-api/Docs/specs/API_CONTRACT.md).

## Quickstart

```bash
npm install
cp .env.example .env

# Terminal 1 — mock API (offline demo)
npm run api

# Terminal 2 — Vite dev server (proxies /v1 → mock)
npm run dev
```

Open http://localhost:5173 — demo API key: `demo-partner-key` (see `.env.example`).

Point to real Laravel API:

```bash
VITE_API_BASE=http://localhost/v1 npm run dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run api` | AcmePay mock on :8787 |
| `npm run build` | Production build |
| `npm run test` | Vitest |
| `npm run lint` | ESLint |

## Deploy (Vercel)

`vercel.json` runs the static build; set `VITE_API_BASE` to your Laravel URL or
leave empty to use the bundled mock via proxy in preview.

## Docs for agents

Start at [`AGENTS.md`](AGENTS.md).
