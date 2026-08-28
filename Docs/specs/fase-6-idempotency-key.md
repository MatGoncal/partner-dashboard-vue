# Fase 6 — Idempotency-Key on payment create

## Contexto / Objetivo

The Laravel API already retains/resumes create on `Idempotency-Key` (wallet
fase 10). This dashboard never sends the header, so a double-click or a 502
retry (Go down mid-create) mints a second payment.

This phase sends `Idempotency-Key` on `POST /v1/payments`. The API contract
does **not** change: the header stays **optional**. Curl without it still
creates a new UUID. Partner JSON / `transform` still omit `provider_charge_id`.

The dashboard does not create payouts in v1; if it does later, use the same
helper with prefix `payout:`.

## Endpoints (if applicable)

| Method | Route | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/payments` | Bearer + optional `Idempotency-Key` | Unchanged 201. Client now always sends the header. |

## Request / Response

Body unchanged (`amount` integer minor units). Header:

```
Idempotency-Key: pay:<external_id>
```

or a UUID generated in composable memory when `external_id` is empty.

201 partner shape unchanged. OpenAPI still lists the header as optional.

## Fluxo (passo a passo)

1. `usePayments.createPayment` resolves the key **before** `fetch`:
   - if `external_id` is non-empty after trim → `pay:` + that value (F5 with
     the same external id reuses the charge).
   - else → UUID stored on the composable instance (refresh = new key —
     documented).
2. Double-click / overlapping calls with the same payload reuse that key
   (assignment is sync, before `await`).
3. On **success**, clear the in-memory UUID so the next create is a new
   attempt. Derived `pay:` keys do not need clearing.
4. On **error** (including 502), keep the in-memory UUID so retry sends the
   same header (wallet fase 10 resume).
5. `apiClient` already spreads `options.headers`; the composable passes
   `Idempotency-Key`.
6. Create without the header (curl) remains a new UUID — Fase 10 regression,
   documented, not fixed here.

## Códigos de erro

| Code | Situation |
|------|-----------|
| 201 | Create / resume (same `id` when the key is reused) |
| 409 `1043` | Same key, different body (API; UI should not change payload on retry) |
| 502 | Go down; retry with the same key after Go is up |

## Critérios de aceite

- [x] Create always sends `Idempotency-Key`
- [x] Double submit / 502 + retry in the UI → **one** payment, same `id`
- [x] `external_id` present → key is `pay:` + external_id (survives F5)
- [x] No `external_id` → UUID in memory (refresh = new key, documented)
- [x] Curl without the header still mints a new UUID (API unchanged)
- [x] No `provider_charge_id` on partner JSON / OpenAPI / `transform`

## Testes obrigatórios

- [x] Vitest: create calls fetch with the header
- [x] Vitest: second call with the same payload reuses the same key
- [x] Manual against mock or Laravel API

## Env vars

None.

## Dependências / Rollback

- Dependências: wallet fase 10 (`Idempotency-Key` retain/resume).
- Rollback: stop sending the header (API still optional).
- Out of scope: making API create without header idempotent; exposing
  `provider_charge_id`; payout create UI (none today).
