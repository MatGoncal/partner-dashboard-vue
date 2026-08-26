<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div class="layout">
    <aside class="layout__sidebar">
      <div class="brand">
        <span class="brand__mark">A</span>
        <div>
          <strong>AcmePay</strong>
          <span class="muted">Partner</span>
        </div>
      </div>
      <nav class="nav">
        <RouterLink to="/transactions" class="nav__link">Transactions</RouterLink>
        <RouterLink to="/payments/new" class="nav__link">Create payment</RouterLink>
        <RouterLink to="/balances" class="nav__link">Balances</RouterLink>
      </nav>
      <p class="sidebar__note muted">
        Demo dashboard — AcmePay v1 contract. Money as integer minor units.
      </p>
    </aside>
    <main class="layout__main">
      <RouterView />
    </main>
  </div>
</template>
