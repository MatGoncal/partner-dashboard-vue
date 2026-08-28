import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent } from 'vue';

import { usePayments } from '@/composables/usePayments';
import { apiRequest } from '@/lib/apiClient';

vi.mock('@/lib/apiClient', () => ({
  apiRequest: vi.fn(),
}));

const payment = {
  id: 'pay_1',
  status: 'PENDING' as const,
  amount: 1500,
  currency: 'BRL',
  created_at: '2026-01-01T00:00:00Z',
};

function mountPayments(): ReturnType<typeof usePayments> {
  let api!: ReturnType<typeof usePayments>;
  const app = createApp(
    defineComponent({
      setup() {
        api = usePayments();
        return () => null;
      },
    }),
  );
  app.mount(document.createElement('div'));
  return api;
}

describe('usePayments createPayment Idempotency-Key', () => {
  afterEach(() => {
    vi.mocked(apiRequest).mockReset();
    vi.restoreAllMocks();
  });

  it('sends Idempotency-Key and reuses it on overlapping creates with the same payload', async () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    vi.mocked(apiRequest).mockResolvedValue(payment);

    const { createPayment } = mountPayments();
    const payload = { amount: 1500, currency: 'BRL' };

    await Promise.all([createPayment(payload), createPayment(payload)]);

    expect(apiRequest).toHaveBeenCalledTimes(2);
    const firstHeaders = vi.mocked(apiRequest).mock.calls[0]?.[1]?.headers as Record<string, string>;
    const secondHeaders = vi.mocked(apiRequest).mock.calls[1]?.[1]?.headers as Record<string, string>;
    expect(firstHeaders['Idempotency-Key']).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    expect(secondHeaders['Idempotency-Key']).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  });

  it('uses pay:{external_id} so a retry after F5 would send the same key', async () => {
    vi.mocked(apiRequest).mockResolvedValue(payment);

    const { createPayment } = mountPayments();
    await createPayment({ amount: 1500, currency: 'BRL', external_id: 'order-9' });

    const headers = vi.mocked(apiRequest).mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBe('pay:order-9');
  });

  it('keeps the same key when the first create fails (502 retry)', async () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    vi.mocked(apiRequest)
      .mockRejectedValueOnce(new Error('Upstream API unreachable'))
      .mockResolvedValueOnce(payment);

    const { createPayment } = mountPayments();
    const payload = { amount: 1500, currency: 'BRL' };

    expect(await createPayment(payload)).toBeNull();
    expect(await createPayment(payload)).toEqual(payment);

    const firstHeaders = vi.mocked(apiRequest).mock.calls[0]?.[1]?.headers as Record<string, string>;
    const secondHeaders = vi.mocked(apiRequest).mock.calls[1]?.[1]?.headers as Record<string, string>;
    expect(firstHeaders['Idempotency-Key']).toBe('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    expect(secondHeaders['Idempotency-Key']).toBe(firstHeaders['Idempotency-Key']);
  });
});
