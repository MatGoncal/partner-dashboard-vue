<script setup lang="ts">
import CountdownTimer from '@/components/CountdownTimer.vue';
import { formatMoney } from '@/lib/money';
import type { FxQuote } from '@/types/api';

defineProps<{
  quote: FxQuote | null;
  loading: boolean;
  secondsRemaining: number;
  isActive: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: { source_currency: string; target_currency: string; amount: number }];
  clear: [];
}>();

const sourceCurrency = 'BRL';
const targetCurrency = 'USD';

function onSubmit(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const amountRaw = (form.elements.namedItem('amount') as HTMLInputElement).value;
  const minor = Math.round(Number(amountRaw.replace(',', '.')) * 100);
  if (!Number.isFinite(minor) || minor <= 0) return;

  emit('submit', {
    source_currency: sourceCurrency,
    target_currency: targetCurrency,
    amount: minor,
  });
}
</script>

<template>
  <section class="card">
    <header class="section-header">
      <div>
        <h2>FX quote</h2>
        <p class="muted">Rate lock window (5 min) — BRL → USD</p>
      </div>
      <CountdownTimer
        v-if="quote"
        :seconds="secondsRemaining"
        :active="isActive"
      />
    </header>

    <form class="fx-form" @submit="onSubmit">
      <label>
        Amount (BRL)
        <input name="amount" type="text" placeholder="100.00" required />
      </label>
      <button type="submit" :disabled="loading">Get quote</button>
      <button v-if="quote" type="button" class="ghost" @click="emit('clear')">Clear</button>
    </form>

    <div v-if="quote" class="quote-result">
      <p>
        <span class="muted">Source</span>
        {{ formatMoney(quote.source_amount, quote.source_currency) }}
      </p>
      <p>
        <span class="muted">Target</span>
        {{ formatMoney(quote.target_amount, quote.target_currency) }}
      </p>
      <p>
        <span class="muted">Rate</span>
        <span class="mono">{{ quote.rate }}</span>
      </p>
      <p class="muted mono">Quote {{ quote.quote_id.slice(0, 8) }}…</p>
    </div>
  </section>
</template>
