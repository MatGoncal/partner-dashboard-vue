<script setup lang="ts">
import { formatMoney } from '@/lib/money';
import type { BalanceRow } from '@/types/api';

defineProps<{
  balances: BalanceRow[];
  loading: boolean;
}>();
</script>

<template>
  <div class="balance-grid">
    <article v-for="row in balances" :key="row.currency" class="card balance-card">
      <h3>{{ row.currency }}</h3>
      <dl>
        <div>
          <dt>Available</dt>
          <dd>{{ formatMoney(row.available, row.currency) }}</dd>
        </div>
        <div>
          <dt>Pending</dt>
          <dd class="pending">{{ formatMoney(row.pending, row.currency) }}</dd>
        </div>
      </dl>
    </article>
    <p v-if="!loading && balances.length === 0" class="muted">No balances returned.</p>
  </div>
</template>
