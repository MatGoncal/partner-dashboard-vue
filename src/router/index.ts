import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/transactions',
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('@/views/TransactionsView.vue'),
      meta: { title: 'Transactions' },
    },
    {
      path: '/payments/new',
      name: 'payment-create',
      component: () => import('@/views/PaymentCreateView.vue'),
      meta: { title: 'Create payment' },
    },
    {
      path: '/balances',
      name: 'balances',
      component: () => import('@/views/BalancesView.vue'),
      meta: { title: 'Balances' },
    },
  ],
});

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'Dashboard';
  document.title = `${title} · AcmePay Partner`;
});

export default router;
