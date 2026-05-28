const KEY = 'afm_recently_viewed';
const MAX = 12;

export function trackView(productId: string | number) {
  if (typeof window === 'undefined') return;
  try {
    const stored: (string | number)[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    const updated = [productId, ...stored.filter(id => String(id) !== String(productId))].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export function getRecentlyViewed(): (string | number)[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
