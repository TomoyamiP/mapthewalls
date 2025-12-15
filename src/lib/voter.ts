// src/lib/voter.ts
const KEY = "mtw_voter_id";

/**
 * Anonymous-but-stable ID stored in localStorage.
 * Used to limit votes to 1 per spot per device/browser.
 */
export function getVoterId(): string {
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;

  const fresh = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(KEY, fresh);
  return fresh;
}
