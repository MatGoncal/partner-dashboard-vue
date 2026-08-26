# Product — AcmePay Partner Dashboard

## Goal

Give partners a lightweight web UI to monitor PIX cash-in transactions, request
FX quotes with visible rate-lock expiry, create new charges (QR + status polling),
and inspect multi-currency balances.

## Users

- Partner ops / finance (demo persona)

## Screens

1. **Transactions** — filterable paginated payment list
2. **Create payment** — amount + QR + live status poll
3. **Balances** — per-currency available/pending + FX quote panel

## Non-goals (v1)

- Auth UI (API key in env)
- Payout initiation (API-only in Laravel)
