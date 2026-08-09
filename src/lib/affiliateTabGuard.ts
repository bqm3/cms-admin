// Cooldown time in milliseconds (10 minutes)
export const AFFILIATE_COOLDOWN_MS = 10 * 60 * 1000;

export function wasAffiliateOpenedRecently(postId: string | number): boolean {
  if (typeof window === "undefined" || !postId) return false;
  try {
    const key = `aff_opened_${postId}`;
    const item = localStorage.getItem(key);
    if (!item) return false;
    const timestamp = parseInt(item, 10);
    if (isNaN(timestamp)) return false;
    return Date.now() - timestamp < AFFILIATE_COOLDOWN_MS;
  } catch (err) {
    console.error("Error reading affiliate cooldown from localStorage:", err);
    return false;
  }
}

export function markAffiliateOpened(postId: string | number): void {
  if (typeof window === "undefined" || !postId) return;
  try {
    const key = `aff_opened_${postId}`;
    localStorage.setItem(key, Date.now().toString());
  } catch (err) {
    console.error("Error setting affiliate timestamp in localStorage:", err);
  }
}

export function openAffiliateOnce(postId: string | number, url: string | null): boolean {
  if (!url || !postId) return false;
  if (wasAffiliateOpenedRecently(postId)) return false;

  // Ghi dấu ngay lập tức để không bị mở lại ở trang tiếp theo do race condition/unmount/popup block
  markAffiliateOpened(postId);

  if (typeof window !== "undefined") {
    try {
      const win = window.open(url, "_blank", "noopener,noreferrer");
      return !!win;
    } catch {
      return false;
    }
  }
  return false;
}
