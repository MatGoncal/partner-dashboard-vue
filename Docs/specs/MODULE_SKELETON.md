# MODULE_SKELETON — partner-dashboard-vue

```
src/
├── composables/use<Domain>.ts    # API + reactive state
├── views/<Name>View.vue          # Route-level pages
├── components/<Name>.vue         # Presentational / forms
├── lib/apiClient.ts              # fetch + auth header
├── lib/money.ts                  # minor-unit formatting (no float money)
├── types/api.ts                  # Contract types
└── router/index.ts
Docs/modulos/<domain>.md
Docs/specs/fase-N-<name>.md
tests/<name>.test.ts
```

## Rules

1. Composables own loading/error state and API calls.
2. Views compose composables + components; avoid fetch in components.
3. Money: integer minor units to API; display via `lib/money.ts`.
4. Contract changes → update `Docs/specs/API_CONTRACT.md` in `_shared` first.
