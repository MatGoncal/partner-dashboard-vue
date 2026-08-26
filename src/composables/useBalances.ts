import { ref } from 'vue';
import { apiRequest } from '@/lib/apiClient';
import type { BalanceRow, BalancesResponse } from '@/types/api';

export function useBalances() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const balances = ref<BalanceRow[]>([]);

  async function fetchBalances(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const result = await apiRequest<BalancesResponse>('/balances');
      balances.value = result.balances;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load balances';
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    balances,
    fetchBalances,
  };
}
