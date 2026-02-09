/**
 * Date localization: format, locale, week start. All from appConfig (env).
 * Use formatDate/parseDate so validation and UI adapt automatically.
 */
import { format, parse } from 'date-fns'
import { enGB, enIN, enUS } from 'date-fns/locale'
import { appConfig } from './appConfig'

const LOCALE_MAP = {
  'en-GB': enGB,
  'en-IN': enIN,
  'en-US': enUS,
} as const

/** date-fns format pattern for the configured DATE_FORMAT. */
const FORMAT_PATTERNS: Record<typeof appConfig.dateFormat, string> = {
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
}

/** Format a date for display/input using configured format and locale. */
export function formatDate(date: Date): string {
  const pattern = FORMAT_PATTERNS[appConfig.dateFormat]
  const locale = LOCALE_MAP[appConfig.locale]
  return format(date, pattern, { locale })
}

/** Parse a date string in the configured format. Returns Invalid Date on failure. */
export function parseDate(str: string): Date {
  if (str.trim() === '') return new Date(NaN)
  const pattern = FORMAT_PATTERNS[appConfig.dateFormat]
  const locale = LOCALE_MAP[appConfig.locale]
  const ref = new Date()
  const d = parse(str, pattern, ref, { locale })
  return d
}

/** date-fns locale object for the configured LOCALE. */
export function getDateLocale() {
  return LOCALE_MAP[appConfig.locale]
}

/** 0 = Sunday, 1 = Monday for date-fns startOfWeek/endOfWeek. */
export function getWeekStartsOn(): 0 | 1 {
  return appConfig.weekStart === 'Monday' ? 1 : 0
}

/** Current format pattern (e.g. yyyy-MM-dd) for use in inputs. */
export function getDateFormatPattern(): string {
  return FORMAT_PATTERNS[appConfig.dateFormat]
}

/** True when format is YYYY-MM-DD (can use input type="date"). */
export function isIsoDateFormat(): boolean {
  return appConfig.dateFormat === 'YYYY-MM-DD'
}
