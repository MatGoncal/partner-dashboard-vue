<script setup lang="ts">
import { ref } from 'vue';
import QrDisplay from '@/components/QrDisplay.vue';
import { usePayments } from '@/composables/usePayments';
import { parseDecimalToMinorUnits } from '@/lib/money';

const paymentsApi = usePayments();

const amountInput = ref('15.00');
const externalId = ref('');
const description = ref('');

async function onSubmit(): Promise<void> {
  const amount = parseDecimalToMinorUnits(amountInput.value, 'BRL');
  if (amount === null || amount <= 0) {
    paymentsApi.error.value = 'Enter a valid BRL amount (e.g. 15.00)';
    return;
  }

  paymentsApi.stopPolling();
  const payment = await paymentsApi.createPayment({
    amount,
    currency: 'BRL',
    external_id: externalId.value.trim() || undefined,
    description: description.value.trim() || undefined,
  });

  if (payment?.status === 'PENDING') {
    paymentsApi.startPolling(payment.id);
  }
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Create payment</h1>
        <p class="muted">POST /v1/payments — QR display and status polling</p>
      </div>
    </header>

    <p v-if="paymentsApi.error.value" class="error">{{ paymentsApi.error.value }}</p>

    <form class="card create-form" @submit.prevent="onSubmit">
      <label>
        Amount (BRL)
        <input v-model="amountInput" type="text" required placeholder="15.00" />
      </label>
      <label>
        External ID
        <input v-model="externalId" type="text" placeholder="order-123" />
      </label>
      <label>
        Description
        <input v-model="description" type="text" maxlength="140" placeholder="Checkout order" />
      </label>
      <button type="submit" :disabled="paymentsApi.loading.value">Create PIX charge</button>
    </form>

    <QrDisplay
      v-if="paymentsApi.currentPayment.value"
      :payment="paymentsApi.currentPayment.value"
      :polling="paymentsApi.polling.value"
    />
  </div>
</template>
