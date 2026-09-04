/**
 * guestCart.js
 *
 * Safe localStorage helpers for the guest cart.
 * Stores only: [{ productId, size, qty }]
 * Never stores price, name, image, or totals — those come from the server.
 *
 * All reads are wrapped in try/catch so corrupted localStorage never
 * crashes the application.
 */

const GUEST_CART_KEY = "shreeji:guest:cart";

/**
 * Read the guest cart from localStorage.
 * Returns an empty array on any parse error or invalid shape.
 * @returns {{ productId: string, size: string, qty: number }[]}
 */
export function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Validate each item — drop anything that doesn't look right
    return parsed.filter(
      (item) =>
        item &&
        typeof item.productId === "string" &&
        item.productId.length > 0 &&
        typeof item.qty === "number" &&
        Number.isInteger(item.qty) &&
        item.qty >= 1
    );
  } catch {
    // Corrupted JSON — silently recover with empty cart
    return [];
  }
}

/**
 * Write the guest cart to localStorage.
 * Only persists { productId, size, qty } — strips everything else.
 * @param {{ productId: string, size?: string, qty: number }[]} items
 */
export function writeGuestCart(items) {
  try {
    if (!Array.isArray(items)) return;

    const safe = items
      .filter(
        (item) =>
          item &&
          typeof item.productId === "string" &&
          item.productId.length > 0 &&
          Number.isInteger(item.qty) &&
          item.qty >= 1
      )
      .map((item) => ({
        productId: item.productId,
        size: typeof item.size === "string" ? item.size : "",
        qty: item.qty,
      }));

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(safe));
  } catch {
    // If localStorage is full or unavailable, fail silently
  }
}

/**
 * Clear the guest cart from localStorage.
 * Called after a successful login merge.
 */
export function clearGuestCart() {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // Fail silently
  }
}
