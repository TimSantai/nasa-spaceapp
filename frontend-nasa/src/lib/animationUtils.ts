/**
 * Quartic ease-out curve for snappy, organic UI number animations.
 * Decelerates fast to give immediate feedback, then smoothly glides into the final number.
 */
export function easeOutQuart(x: number): number {
  const clamped = Math.max(0, Math.min(1, x));
  return 1 - Math.pow(1 - clamped, 4);
}

/**
 * Computes the interpolated value between start and end given a normalized progress [0..1].
 */
export function interpolateValue(start: number, end: number, progress: number): number {
  const ease = easeOutQuart(progress);
  return start + (end - start) * ease;
}

/**
 * Formats a numeric value consistently with specified decimal places.
 */
export function formatAnimatedNumber(value: number, decimals: number = 0): string {
  if (decimals === 0) {
    return Math.round(value).toString();
  }
  return value.toFixed(decimals);
}
