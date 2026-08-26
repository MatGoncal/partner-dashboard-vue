<script setup lang="ts">
import { onMounted } from 'vue';
import FxQuotePanel from '@/components/FxQuotePanel.vue';
import PaymentFilters from '@/components/PaymentFilters.vue';
import PaymentTable from '@/components/PaymentTable.vue';
import { useFxQuote } from '@/composables/useFxQuote';
import { usePayments } from '@/composables/usePayments';
import type { PaymentStatus } from '@/types/api';

const paymentsApi = usePayments();
const fxApi = useFxQuote();

onMounted(() => {
  paymentsApi.fetchPayments();
});

function onFxSubmit(payload: {
  source_currency: string;
  target_currency: string;
  amount: number;
}): void {
  fxApi.fetchQuote(payload);
}

function onFilterApply(payload: { status: PaymentStatus | ''; external_id: string }): void {
  paymentsApi.filters.value.status = payload.status;
  paymentsApi.filters.value.external_id = payload.external_id;
  paymentsApi.applyFilters();
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Transactions</h1>
        <p class="muted">Payments list with filters and pagination</p>
      </div>
      <button type="button" class="ghost" :disabled="paymentsApi.loading.value" @click="paymentsApi.fetchPayments()">
        Refresh
      </button>
    </header>

    <p v-if="paymentsApi.error.value" class="error">{{ paymentsApi.error.value }}</p>

    <PaymentFilters
      :loading="paymentsApi.loading.value"
      @apply="onFilterApply"
      @reset="paymentsApi.resetFilters()"
    />

    <PaymentTable :items="paymentsApi.payments.value" :loading="paymentsApi.loading.value" />

    <nav v-if="paymentsApi.meta.value" class="pagination">
      <button
        type="button"
        class="ghost"
        :disabled="!paymentsApi.hasPrevPage.value || paymentsApi.loading.value"
        @click="paymentsApi.setPage(paymentsApi.meta.value!.page - 1)"
      >
        Previous
      </button>
      <span class="muted">
        Page {{ paymentsApi.meta.value.page }} of {{ paymentsApi.meta.value.total_pages }}
        ({{ paymentsApi.meta.value.total }} total)
      </span>
      <button
        type="button"
        class="ghost"
        :disabled="!paymentsApi.hasNextPage.value || paymentsApi.loading.value"
        @click="paymentsApi.setPage(paymentsApi.meta.value!.page + 1)"
      >
        Next
      </button>
    </nav>

    <FxQuotePanel
      :quote="fxApi.quote.value"
      :loading="fxApi.loading.value"
      :seconds-remaining="fxApi.secondsRemaining.value"
      :is-active="fxApi.isActive.value"
      @submit="onFxSubmit"
      @clear="fxApi.clearQuote()"
    />
  </div>
</template>
