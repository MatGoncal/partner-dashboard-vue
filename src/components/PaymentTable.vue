<script setup lang="ts">
import StatusBadge from '@/components/StatusBadge.vue';
import { formatMoney } from '@/lib/money';
import type { Payment } from '@/types/api';

defineProps<{
  items: Payment[];
  loading: boolean;
}>();
</script>

<template>
  <div class="card table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>External</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="5" class="muted">Loading…</td>
        </tr>
        <tr v-else-if="items.length === 0">
          <td colspan="5" class="muted">No payments match filters.</td>
        </tr>
        <tr v-for="item in items" :key="item.id">
          <td class="mono">{{ item.id.slice(0, 8) }}…</td>
          <td>{{ item.external_id ?? '—' }}</td>
          <td>{{ formatMoney(item.amount, item.currency) }}</td>
          <td><StatusBadge :status="item.status" /></td>
          <td>{{ new Date(item.created_at).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
