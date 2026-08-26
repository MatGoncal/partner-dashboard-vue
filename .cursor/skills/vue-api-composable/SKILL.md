---
name: vue-api-composable
description: Create Vue 3 composables for AcmePay API domains (payments, balances, fx).
---

# Vue API composable pattern

## Structure

```ts
export function usePayments() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  // domain refs...

  async function fetchPayments() { /* apiRequest */ }

  return { loading, error, fetchPayments };
}
```

## Rules

1. Use `apiRequest` from `src/lib/apiClient.ts` (Bearer API key).
2. Expose `loading`, `error`, and domain state as refs.
3. Clean up timers/intervals in `onUnmounted`.
4. Types from `src/types/api.ts` aligned with API_CONTRACT.
5. Never send float amounts — parse UI decimals to minor units before POST.
