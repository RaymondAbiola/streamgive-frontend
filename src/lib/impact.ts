import { getNgo, getNgos } from './api';

export type PlatformImpact = {
  totalCommitted: bigint;
  totalWithdrawn: bigint;
  activeStreams: number;
  ngoCount: number;
};

/**
 * There's no platform-wide aggregate endpoint on the backend — only
 * per-NGO stats (/ngos/:id, /impact/:ngoId). This fetches every verified
 * NGO's profile and sums client-side instead. Fine at the NGO counts a
 * new platform would actually have; the first thing to replace with a
 * real backend aggregate if that list ever gets large (N+1 fetches).
 *
 * Donor counts are deliberately not summed here: a donor who gives to two
 * NGOs would be counted twice, and per-NGO stats have carried no way to
 * dedupe that from the frontend.
 *
 * @throws {Error} when the StreamGive API is unreachable — callers decide
 * how to degrade (the impact page shows an error, the landing page hides
 * the stats strip).
 */
export async function loadPlatformImpact(): Promise<PlatformImpact> {
  const ngos = await getNgos();
  const profiles = await Promise.all(ngos.map((ngo) => getNgo(ngo.id)));

  let totalCommitted = 0n;
  let totalWithdrawn = 0n;
  let activeStreams = 0;

  for (const profile of profiles) {
    if (!profile) continue;
    totalCommitted += BigInt(profile.stats.totalCommitted);
    totalWithdrawn += BigInt(profile.stats.totalWithdrawn);
    activeStreams += profile.stats.activeStreamCount;
  }

  return { totalCommitted, totalWithdrawn, activeStreams, ngoCount: ngos.length };
}
