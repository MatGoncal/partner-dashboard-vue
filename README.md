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

Point to real Laravel or Nest API:

```bash
VITE_API_BASE_URL=http://localhost/v1 npm run dev
```

## Demo credentials

The default `VITE_API_KEY=demo-partner-key` is a **portfolio demo key** shipped for
local mock and preview environments. It is not a production secret.

In production, partner credentials should never live in the browser bundle. The
[checkout-portal-next](../checkout-portal-next/) BFF pattern keeps `API_KEY`
server-side and proxies same-origin `/api/v1/*` routes; this dashboard would
follow the same approach in a real deployment.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run api` | AcmePay mock on :8787 |
| `npm run build` | Production build |
| `npm run test` | Vitest |
| `npm run lint` | ESLint |

## Deploy (Vercel)

`vercel.json` runs the static build. Set `VITE_API_BASE_URL` to your API origin
(e.g. `https://api.example.com/v1`) or leave empty to rely on the Vite dev proxy
to the bundled mock in preview.

## Docs for agents

Start at [`AGENTS.md`](AGENTS.md).
