import type { WalletSignMessage } from '@/components/wallet/WalletProvider';

import type { NgoApplication } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/** Mirrors the backend's requireAdminSignature exactly: signs
 * `${method}:${path}:${timestamp}` and sends the pieces as headers. `path`
 * must match what Fastify sees as `request.url` — origin excluded, query
 * string included if present. */
async function adminFetch(
  method: string,
  path: string,
  address: string,
  signMessage: WalletSignMessage,
  body?: unknown,
): Promise<Response> {
  const timestamp = Date.now().toString();
  const payload = `${method}:${path}:${timestamp}`;
  const signature = await signMessage(payload);

  return fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-admin-address': address,
      'x-admin-signature': signature,
      'x-admin-timestamp': timestamp,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/** The paginated envelope GET /ngo-applications responds with. The other
  * list endpoints return bare arrays; this one does not. */
type NgoApplicationPage = {
  applications: NgoApplication[];
  total: number;
  limit: number;
  offset: number;
};

export async function listNgoApplications(
  address: string,
  signMessage: WalletSignMessage,
  status?: 'PENDING' | 'APPROVED' | 'REJECTED',
): Promise<NgoApplication[]> {
  const path = status ? `/ngo-applications?status=${status}` : '/ngo-applications';
  const res = await adminFetch('GET', path, address, signMessage);
  if (!res.ok) {
    throw new Error(`Failed to fetch applications: ${res.status}`);
  }

  const body = (await res.json()) as NgoApplicationPage;

  // Checked rather than assumed. This endpoint used to return a bare array
  // and grew an envelope when pagination was added; the mismatch surfaced
  // as a page that rendered neither the list nor its empty state, because
  // `undefined > 0` and `undefined === 0` are both false. Fail loudly if
  // the shape moves again.
  if (!Array.isArray(body?.applications)) {
    throw new Error(
      'Unexpected response from /ngo-applications: expected an { applications: [...] } envelope.',
    );
  }

  return body.applications;
}

export async function reviewNgoApplication(
  address: string,
  signMessage: WalletSignMessage,
  id: string,
  action: 'approve' | 'reject',
): Promise<NgoApplication> {
  const path = `/ngo-applications/${id}/${action}`;
  const res = await adminFetch('POST', path, address, signMessage, {});
  if (!res.ok) {
    throw new Error(`Failed to ${action} application: ${res.status}`);
  }
  return res.json();
}
