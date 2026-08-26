<script setup lang="ts">
import { onMounted } from 'vue';
import BalanceGrid from '@/components/BalanceGrid.vue';
import { useBalances } from '@/composables/useBalances';

const { loading, error, balances, fetchBalances } = useBalances();

onMounted(() => {
  fetchBalances();
});
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Balances</h1>
        <p class="muted">Multi-currency ledger — GET /v1/balances</p>
      </div>
      <button type="button" class="ghost" :disabled="loading" @click="fetchBalances()">
        Refresh
      </button>
    </header>

    <p v-if="error" class="error">{{ error }}</p>

    <BalanceGrid :balances="balances" :loading="loading" />
  </div>
</template>
