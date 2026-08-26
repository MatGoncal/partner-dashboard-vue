<script setup lang="ts">
import { ref } from 'vue';
import type { PaymentStatus } from '@/types/api';

const props = defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  apply: [payload: { status: PaymentStatus | ''; external_id: string }];
  reset: [];
}>();

const statuses: PaymentStatus[] = ['PENDING', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED'];
const status = ref<PaymentStatus | ''>('');
const externalId = ref('');

function onSubmit(): void {
  emit('apply', { status: status.value, external_id: externalId.value });
}

function onReset(): void {
  status.value = '';
  externalId.value = '';
  emit('reset');
}
</script>

<template>
  <form class="filters card" @submit.prevent="onSubmit">
    <div class="filters__row">
      <label>
        Status
        <select v-model="status">
          <option value="">All</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label>
        External ID
        <input
          v-model="externalId"
          type="search"
          placeholder="order-101"
          autocomplete="off"
        >
      </label>
      <div class="filters__actions">
        <button type="submit" :disabled="props.loading">Apply</button>
        <button type="button" class="ghost" :disabled="props.loading" @click="onReset">
          Reset
        </button>
      </div>
    </div>
  </form>
</template>
