/**
 * Mask Aadhaar: show only last 4 digits
 * Input: "123456789012" → "XXXX XXXX 9012"
 */
export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length !== 12) return "XXXX XXXX XXXX";
  const last4 = aadhaar.slice(-4);
  return `XXXX XXXX ${last4}`;
}

/**
 * Mask PAN: show only last char and first char group
 * Input: "ABCDE1234F" → "ABCDE****F"
 */
export function maskPan(pan: string): string {
  if (!pan || pan.length !== 10) return "XXXXXXXXXX";
  return `${pan.slice(0, 5)}****${pan.slice(-1)}`;
}

/**
 * Format Aadhaar for display: "123456789012" → "1234 5678 9012"
 */
export function formatAadhaar(digits: string): string {
  const cleaned = digits.replace(/\D/g, "").slice(0, 12);
  const parts = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }
  return parts.join(" ");
}

/**
 * Generate a human-readable registration reference ID
 * e.g. WR-20260810-A3F7
 */
export function generateRefId(uuid: string): string {
  const date = new Date();
  const dateStr = date
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const suffix = uuid.slice(0, 4).toUpperCase();
  return `WR-${dateStr}-${suffix}`;
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}
