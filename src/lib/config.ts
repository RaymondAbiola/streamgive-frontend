/**
 * Server-render fallback for the app's own origin.
 *
 * In the browser the real origin is read from `window` instead (see
 * EmbedSnippet), so this value only ever appears in server-rendered HTML
 * before hydration. Deployments do not need to set NEXT_PUBLIC_APP_URL.
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
