import { ref, computed, onUnmounted } from 'vue';
import { apiRequest } from '@/lib/apiClient';
import type { CreateFxQuotePayload, FxQuote } from '@/types/api';

export function useFxQuote() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const quote = ref<FxQuote | null>(null);
  const secondsRemaining = ref(0);

  let countdownTimer: ReturnType<typeof setInterval> | null = null;

  const isExpired = computed(() => secondsRemaining.value <= 0 && quote.value !== null);
  const isActive = computed(() => quote.value !== null && secondsRemaining.value > 0);

  function stopCountdown(): void {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function startCountdown(expiresAt: string): void {
    stopCountdown();

    const tick = () => {
      const diffMs = new Date(expiresAt).getTime() - Date.now();
      secondsRemaining.value = Math.max(0, Math.ceil(diffMs / 1000));
      if (secondsRemaining.value <= 0) {
        stopCountdown();
      }
    };

    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  async function fetchQuote(payload: CreateFxQuotePayload): Promise<FxQuote | null> {
    loading.value = true;
    error.value = null;
    try {
      const result = await apiRequest<FxQuote>('/fx/quotes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      quote.value = result;
      startCountdown(result.expires_at);
      return result;
    } catch (e) {
      quote.value = null;
      secondsRemaining.value = 0;
      error.value = e instanceof Error ? e.message : 'Failed to fetch FX quote';
      return null;
    } finally {
      loading.value = false;
    }
  }

  function clearQuote(): void {
    quote.value = null;
    secondsRemaining.value = 0;
    stopCountdown();
  }

  function formatCountdown(): string {
    const s = secondsRemaining.value;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  onUnmounted(() => stopCountdown());

  return {
    loading,
    error,
    quote,
    secondsRemaining,
    isExpired,
    isActive,
    fetchQuote,
    clearQuote,
    formatCountdown,
  };
}
