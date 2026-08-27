import { afterEach, describe, expect, it, vi } from 'vitest';

describe('apiClient env', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('reads VITE_API_BASE_URL for request paths', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/v1');
    vi.stubEnv('VITE_API_KEY', 'demo-partner-key');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ data: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { apiRequest } = await import('@/lib/apiClient');
    await apiRequest('/payments');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/payments',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer demo-partner-key',
        }),
      }),
    );
  });
});
