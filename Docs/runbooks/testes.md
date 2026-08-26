# Runbook — tests

## Unit / component

```bash
npm run test
```

## Lint

```bash
npm run lint
```

## Manual E2E (mock)

```bash
npm run api
npm run dev
```

1. Transactions — filter by PAID, paginate
2. Create payment — wait ~8s for mock auto-PAID
3. Balances — refresh after payment settles
4. FX quote — watch countdown expire

## Against Laravel API

Point `VITE_API_BASE_URL` to Sail `pix-wallet-api`. Note: Laravel may not expose
`GET /v1/payments` list until added — use mock for list UX or extend API.
