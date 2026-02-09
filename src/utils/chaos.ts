/**
 * Chaos utilities: deterministic per-session randomness for CHAOS_LEVEL (0–3).
 * When chaosLevel is 0, all helpers no-op or pass through. Never blocks completion.
 */

import { appConfig } from '../config/appConfig'
import { delay } from './delay'

/** Session seed set once on first use; same for entire session. */
let sessionSeed: number | null = null

function getSessionSeed(): number {
  if (sessionSeed !== null) return sessionSeed
  const t = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
  const r = typeof crypto !== 'undefined' && crypto.getRandomValues
    ? crypto.getRandomValues(new Uint32Array(1))[0]
    : (Math.random() * 0xffffffff) >>> 0
  sessionSeed = (r ^ ((t * 1000) >>> 0)) >>> 0
  return sessionSeed
}

/** Mulberry32 PRNG. Deterministic for given seed. */
function mulberry32(seed: number): () => number {
  return function next() {
    let s = seed | 0
    s = (s + 0x6d2b79f5) | 0
    const t = Math.imul(s ^ (s >>> 15), 1 | s)
    const u = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    seed = (u ^ (u >>> 14)) >>> 0
    return (seed >>> 0) / 4294967296
  }
}

let chaosRng: (() => number) | null = null

function getChaosRng(): () => number {
  if (chaosRng !== null) return chaosRng
  chaosRng = mulberry32(getSessionSeed())
  return chaosRng
}

/** Returns true if chaos is enabled (level >= 1). */
export function isChaosEnabled(): boolean {
  return appConfig.chaosLevel >= 1
}

/** Random 0–1, deterministic per session. No-op when chaosLevel 0 (returns 0). */
export function chaosRandom(): number {
  if (appConfig.chaosLevel === 0) return 0
  return getChaosRng()()
}

/** Shuffle array in place (Fisher–Yates). Returns same array. When chaosLevel 0, returns unchanged. */
export function chaosShuffle<T>(array: T[]): T[] {
  if (appConfig.chaosLevel === 0 || array.length <= 1) return array
  const rng = getChaosRng()
  for (let i = array.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/** Copy and shuffle. When chaosLevel 0, returns copy in original order. */
export function chaosShuffled<T>(array: readonly T[]): T[] {
  const copy = [...array]
  return appConfig.chaosLevel === 0 ? copy : chaosShuffle(copy)
}

/** Pick one element from array. When chaosLevel 0, returns first. */
export function chaosPick<T>(array: readonly T[]): T {
  if (array.length === 0) throw new Error('chaosPick: empty array')
  if (appConfig.chaosLevel === 0) return array[0]
  const i = (chaosRandom() * array.length) | 0
  return array[i]
}

/** Max variance (ms) added to delays: scale with chaos level, capped for safety. */
const MAX_VARIANCE_MS = 120

function getDelayVarianceMs(): number {
  const level = appConfig.chaosLevel
  if (level === 0) return 0
  const cap = level === 1 ? 30 : level === 2 ? 60 : MAX_VARIANCE_MS
  return (chaosRandom() * 2 - 1) * cap
}

/** Delay with optional variance when chaosLevel >= 1. Never negative; never blocks. */
export function chaosDelay(baseMs: number): Promise<void> {
  if (baseMs <= 0) return Promise.resolve()
  if (appConfig.chaosLevel === 0) return delay(baseMs)
  const variance = getDelayVarianceMs()
  const ms = Math.max(0, Math.round(baseMs + variance))
  return delay(ms)
}
