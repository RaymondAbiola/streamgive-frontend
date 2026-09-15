import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ADDRESS = 'GA4Z4GPSO3FKPMQJ3WCMU5D5WE25SDXZS47YDF3J3NWF65ILGCVJVWIJ';

/**
 * The signature cache lives at module scope, so it would otherwise carry
 * across tests and make each one depend on the order it ran in. Re-importing
 * per test gives every case its own empty cache.
 */
async function freshAdminApi() {
  vi.resetModules();
  return import('./adminApi');
}

function okResponse() {
  return new Response(JSON.stringify({ applications: [], total: 0, limit: 100, offset: 0 }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function unauthorized() {
  return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
}

describe('admin request signing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('signs once and reuses that signature for repeat calls in the window', async () => {
    const { listNgoApplications } = await freshAdminApi();
    const signMessage = vi.fn().mockResolvedValue('c2ln');
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(okResponse())),
    );

    await listNgoApplications(ADDRESS, signMessage, 'PENDING');
    await listNgoApplications(ADDRESS, signMessage, 'PENDING');
    await listNgoApplications(ADDRESS, signMessage, 'PENDING');

    // Three requests, one wallet prompt — this is the whole point.
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(signMessage).toHaveBeenCalledTimes(1);
  });

  it('re-signs once the reuse window has passed', async () => {
    const { listNgoApplications } = await freshAdminApi();
    const signMessage = vi.fn().mockResolvedValue('c2ln');
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(okResponse())),
    );

    await listNgoApplications(ADDRESS, signMessage, 'PENDING');
    vi.advanceTimersByTime(5 * 60 * 1000);
    await listNgoApplications(ADDRESS, signMessage, 'PENDING');

    expect(signMessage).toHaveBeenCalledTimes(2);
  });

  it('signs separately per path, so one signature cannot be aimed elsewhere', async () => {
    const { listNgoApplications } = await freshAdminApi();
    const signMessage = vi.fn().mockResolvedValue('c2ln');
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(okResponse())),
    );

    await listNgoApplications(ADDRESS, signMessage, 'PENDING');
    await listNgoApplications(ADDRESS, signMessage, 'APPROVED');

    expect(signMessage).toHaveBeenCalledTimes(2);
  });

  it('retries once with a fresh signature when a reused one is rejected', async () => {
    const { listNgoApplications } = await freshAdminApi();
    const signMessage = vi.fn().mockResolvedValue('c2ln');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse()) // signs, succeeds
      .mockResolvedValueOnce(unauthorized()) // reuses, server rejects it
      .mockResolvedValueOnce(okResponse()); // retry with a fresh signature
    vi.stubGlobal('fetch', fetchMock);

    await listNgoApplications(ADDRESS, signMessage, 'PENDING');
    await expect(listNgoApplications(ADDRESS, signMessage, 'PENDING')).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(signMessage).toHaveBeenCalledTimes(2);
  });

  it('does not re-prompt when a freshly signed request is rejected', async () => {
    const { listNgoApplications } = await freshAdminApi();
    const signMessage = vi.fn().mockResolvedValue('c2ln');
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(unauthorized())),
    );

    // The wrong wallet is connected. Signing again would just produce another
    // signature from the same wrong key, so it must not ask a second time.
    await expect(listNgoApplications(ADDRESS, signMessage, 'PENDING')).rejects.toThrow(/401/);
    expect(signMessage).toHaveBeenCalledTimes(1);
  });
});
