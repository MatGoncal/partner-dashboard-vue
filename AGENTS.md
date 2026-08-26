# AGENTS.md — partner-dashboard-vue (AcmePay)

> Master index for humans and AI agents. Read this **before** any implementation.

## Project summary

**AcmePay Partner Dashboard** — Vue 3 + TypeScript SPA consuming the shared
AcmePay v1 contract (`Docs/specs/API_CONTRACT.md`). Targets `pix-wallet-api`
(Laravel) in production; ships with `api-mock/server.mjs` for offline demos.

## Stack

| Layer | Choice |
|-------|--------|
| UI | Vue 3 + TypeScript (strict) |
| State | Pinia |
| Routing | Vue Router |
| Build | Vite 6 |
| Tests | Vitest + Testing Library |
| Lint | ESLint 9 |

## Module map

| Module | Responsibility | Doc |
|--------|----------------|-----|
| `transactions` | Payment list, filters, pagination | `Docs/modulos/transactions.md` |
| `payments` | Create PIX + QR + polling | `Docs/modulos/payments.md` |
| `fx` | FX quote + rate-lock countdown | `Docs/modulos/fx.md` |
| `balances` | Multi-currency balances | `Docs/modulos/balances.md` |

## Entrypoints

| Path | Notes |
|------|-------|
| `src/composables/usePayments.ts` | List/create/poll payments |
| `src/composables/useFxQuote.ts` | FX quote + countdown |
| `src/composables/useBalances.ts` | Balances screen |
| `src/lib/apiClient.ts` | Typed HTTP client |
| `api-mock/server.mjs` | Offline AcmePay mock |

## Quick lookup

| Want to understand… | See |
|---------------------|-----|
| HTTP contract | `Docs/specs/API_CONTRACT.md` |
| Fase 0 bootstrap | `Docs/specs/fase-0-bootstrap.md` |
| Fases 1–5 | `Docs/specs/fase-*.md` |
| How to test | `Docs/runbooks/testes.md` |
| Composable pattern | `.cursor/skills/vue-api-composable/SKILL.md` |

## Agent workflow

```
1. Read AGENTS.md
2. Read Docs/modulos/<module>.md and/or Docs/specs/<feature>.md
3. Implement using vue-api-composable skill
4. npm run test && npm run lint
5. Update spec acceptance criteria if behavior changed
```

## Do NOT

- Use `float` for money — integer minor units only in UI state
- Brand as StarsPay — AcmePay only
- Assume Laravel-specific response fields

## PR checklist

- [ ] Spec acceptance criteria updated
- [ ] Vitest green
- [ ] ESLint green
- [ ] Money displayed via `lib/money.ts` formatters
