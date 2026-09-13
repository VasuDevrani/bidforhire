/**
 * Resolves a candidate's avatar URL from their stored social links.
 *
 * Priority:
 *   1. GitHub  → https://github.com/{user}.png  (free, permanent CDN)
 *   2. X / Twitter → https://unavatar.io/x/{handle}  (open-source proxy)
 *   3. DiceBear bottts-neutral fallback (deterministic, zero auth)
 */
export function resolveAvatarUrl(
  name: string,
  socialLinks: Record<string, string>,
): string {
  // ── 1. GitHub ────────────────────────────────────────────────────
  const gh = socialLinks.github ?? '';
  if (gh) {
    // Handles full URLs: https://github.com/username
    const m = gh.match(/github\.com\/([^/?#\s]+)/i);
    const username = m?.[1];
    if (username) return `https://github.com/${username}.png?size=200`;
  }

  // ── 2. X / Twitter ───────────────────────────────────────────────
  const xUrl = socialLinks.x ?? socialLinks.twitter ?? '';
  if (xUrl) {
    // Handles: https://x.com/handle  https://twitter.com/handle
    const m = xUrl.match(/(?:x|twitter)\.com\/([^/?#\s]+)/i);
    const handle = m?.[1];
    if (handle && !['home', 'i', 'search', 'explore'].includes(handle.toLowerCase())) {
      return `https://unavatar.io/x/${handle}`;
    }
  }

  // ── 3. DiceBear fallback ──────────────────────────────────────────
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}