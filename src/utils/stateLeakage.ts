/**
 * Optional cross-scenario state leakage (realistic bank-style).
 * Controlled by VITE_ENABLE_STATE_LEAKAGE. All state is resettable via clearAll() on logout.
 * Uses sessionStorage so it also clears when the tab is closed.
 */

import { appConfig } from '../config/appConfig'

const STORAGE_KEY = 'bank_state_leak'

export interface LeakedDateRange {
  from: string
  to: string
}

interface LeakPayload {
  dateRange?: LeakedDateRange
  /** ISO month "YYYY-MM" (first day of month). */
  calendarMonth?: string
  username?: string
}

function readPayload(): LeakPayload {
  if (typeof sessionStorage === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as LeakPayload
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function writePayload(payload: LeakPayload): void {
  if (!appConfig.enableStateLeakage || typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

/** Returns last stored date range (from/to strings) when leakage is enabled; otherwise null. */
export function getLastDateRange(): LeakedDateRange | null {
  if (!appConfig.enableStateLeakage) return null
  const { dateRange } = readPayload()
  if (!dateRange || typeof dateRange.from !== 'string' || typeof dateRange.to !== 'string') return null
  return { from: dateRange.from, to: dateRange.to }
}

/** Stores date range. No-op when leakage is disabled. */
export function setLastDateRange(range: LeakedDateRange): void {
  const payload = readPayload()
  payload.dateRange = range
  writePayload(payload)
}

/** Returns last stored calendar month (YYYY-MM) when leakage is enabled; otherwise null. */
export function getLastCalendarMonth(): string | null {
  if (!appConfig.enableStateLeakage) return null
  const { calendarMonth } = readPayload()
  if (typeof calendarMonth !== 'string' || !/^\d{4}-\d{2}$/.test(calendarMonth)) return null
  return calendarMonth
}

/** Stores calendar month. No-op when leakage is disabled. */
export function setLastCalendarMonth(month: string): void {
  if (!/^\d{4}-\d{2}$/.test(month)) return
  const payload = readPayload()
  payload.calendarMonth = month
  writePayload(payload)
}

/** Returns last stored username when leakage is enabled; otherwise null. */
export function getLastUsername(): string | null {
  if (!appConfig.enableStateLeakage) return null
  const { username } = readPayload()
  if (typeof username !== 'string' || !username.trim()) return null
  return username.trim()
}

/** Stores username (e.g. after successful login). No-op when leakage is disabled. */
export function setLastUsername(username: string): void {
  const payload = readPayload()
  payload.username = username.trim()
  writePayload(payload)
}

/** Clears all leaked state. Call on logout. */
export function clearAll(): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
