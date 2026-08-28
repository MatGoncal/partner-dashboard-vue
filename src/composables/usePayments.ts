import { ref, computed, onUnmounted } from 'vue';
import { apiRequest } from '@/lib/apiClient';
import {
  clearMemoryIdempotencyKey,
  paymentIdempotencyKey,
  type IdempotencyMemory,
} from '@/lib/idempotencyKey';
import type {
  CreatePaymentPayload,
  Payment,
  PaymentsListResponse,
  PaymentStatus,
} from '@/types/api';

export interface PaymentFilters {
  status?: PaymentStatus | '';
  external_id?: string;
  page: number;
  per_page: number;
}

const DEFAULT_FILTERS: PaymentFilters = {
  status: '',
  external_id: '',
  page: 1,
  per_page: 10,
};

export function usePayments() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const payments = ref<Payment[]>([]);
  const meta = ref<PaymentsListResponse['meta'] | null>(null);
  const filters = ref<PaymentFilters>({ ...DEFAULT_FILTERS });
  const currentPayment = ref<Payment | null>(null);
  const polling = ref(false);
  const createKeyMemory: IdempotencyMemory = { current: null };

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const hasNextPage = computed(() => {
    if (!meta.value) return false;
    return meta.value.page < meta.value.total_pages;
  });

  const hasPrevPage = computed(() => {
    if (!meta.value) return false;
    return meta.value.page > 1;
  });

  function buildQuery(): string {
    const params = new URLSearchParams();
    params.set('page', String(filters.value.page));
    params.set('per_page', String(filters.value.per_page));
    if (filters.value.status) {
      params.set('status', filters.value.status);
    }
    if (filters.value.external_id?.trim()) {
      params.set('external_id', filters.value.external_id.trim());
    }
    return `?${params.toString()}`;
  }

  async function fetchPayments(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const result = await apiRequest<PaymentsListResponse>(`/payments${buildQuery()}`);
      payments.value = result.data;
      meta.value = result.meta;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load payments';
    } finally {
      loading.value = false;
    }
  }

  async function createPayment(payload: CreatePaymentPayload): Promise<Payment | null> {
    loading.value = true;
    error.value = null;
    const idempotencyKey = paymentIdempotencyKey(payload.external_id, createKeyMemory);
    try {
      const payment = await apiRequest<Payment>('/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Idempotency-Key': idempotencyKey },
      });
      currentPayment.value = payment;
      if (!payload.external_id?.trim()) {
        clearMemoryIdempotencyKey(createKeyMemory);
      }
      return payment;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create payment';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPayment(id: string): Promise<Payment | null> {
    try {
      const payment = await apiRequest<Payment>(`/payments/${id}`);
      currentPayment.value = payment;
      return payment;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load payment';
      return null;
    }
  }

  function stopPolling(): void {
    polling.value = false;
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function startPolling(id: string, intervalMs = 3000): void {
    stopPolling();
    polling.value = true;

    pollTimer = setInterval(async () => {
      const payment = await fetchPayment(id);
      if (!payment) return;

      if (payment.status !== 'PENDING') {
        stopPolling();
        await fetchPayments();
      }
    }, intervalMs);
  }

  function setPage(page: number): void {
    filters.value.page = page;
    fetchPayments();
  }

  function applyFilters(): void {
    filters.value.page = 1;
    fetchPayments();
  }

  function resetFilters(): void {
    filters.value = { ...DEFAULT_FILTERS };
    fetchPayments();
  }

  onUnmounted(() => stopPolling());

  return {
    loading,
    error,
    payments,
    meta,
    filters,
    currentPayment,
    polling,
    hasNextPage,
    hasPrevPage,
    fetchPayments,
    createPayment,
    fetchPayment,
    startPolling,
    stopPolling,
    setPage,
    applyFilters,
    resetFilters,
  };
}
