<script setup lang="ts">
import StatusBadge from '@/components/StatusBadge.vue';
import type { Payment } from '@/types/api';

defineProps<{
  payment: Payment;
  polling: boolean;
}>();
</script>

<template>
  <section class="card qr-panel">
    <header class="section-header">
      <div>
        <h2>PIX QR</h2>
        <p class="muted mono">{{ payment.id }}</p>
      </div>
      <StatusBadge :status="payment.status" />
    </header>

    <div class="qr-box">
      <pre class="qr-placeholder">{{ payment.qr_code ?? '—' }}</pre>
    </div>

    <label class="copy-field">
      Copia e cola
      <textarea readonly rows="3" :value="payment.copy_paste ?? ''"></textarea>
    </label>

    <p v-if="polling" class="muted polling-hint">Polling status every 3s…</p>
    <p v-if="payment.paid_at" class="success">
      Paid at {{ new Date(payment.paid_at).toLocaleString() }}
    </p>
  </section>
</template>
