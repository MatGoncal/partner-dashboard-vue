<script setup lang="ts">
defineProps<{
  seconds: number;
  active: boolean;
}>();

function format(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
</script>

<template>
  <div class="countdown" :class="{ 'countdown--expired': !active }">
    <span class="countdown__label">Rate lock</span>
    <strong>{{ active ? format(seconds) : 'Expired' }}</strong>
  </div>
</template>
