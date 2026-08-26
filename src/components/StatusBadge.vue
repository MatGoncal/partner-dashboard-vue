<script setup lang="ts">
import type { PaymentStatus } from '@/types/api';

defineProps<{
  status: PaymentStatus;
}>();

const statusClass: Record<PaymentStatus, string> = {
  PENDING: 'badge--pending',
  PAID: 'badge--paid',
  EXPIRED: 'badge--expired',
  FAILED: 'badge--failed',
  CANCELLED: 'badge--cancelled',
};
</script>

<template>
  <span class="badge" :class="statusClass[status]">{{ status }}</span>
</template>
