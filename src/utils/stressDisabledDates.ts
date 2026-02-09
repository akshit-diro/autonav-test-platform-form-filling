/**
 * Deterministic rule for "disabled dates after selection" stress feature.
 * Same date always returns same result. Used after user has made a selection.
 */
export function isDateDisabledAfterSelection(date: Date): boolean {
  const d = date.getDate()
  const m = date.getMonth()
  const y = date.getFullYear()
  return (d + m + y) % 2 === 0
}
