/**
 * Generates pseudo-random positive integer sequence based on seed
 */
export function simpleSeeded(seed: number) {
  return () => Math.floor(Math.abs(Math.sin(seed++)) * 1000000)
}
