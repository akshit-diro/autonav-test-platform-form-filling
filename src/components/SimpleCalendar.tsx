import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { getDateLocale, getWeekStartsOn, formatDate } from '../config/dateLocale'

function getWeekdayHeaders(): string[] {
  const locale = getDateLocale()
  const weekStartsOn = getWeekStartsOn()
  const base = new Date(2025, 0, 5 + weekStartsOn)
  return [0, 1, 2, 3, 4, 5, 6].map((i) =>
    format(addDays(base, i), 'EEE', { locale })
  )
}

export interface SimpleCalendarProps {
  /** Currently displayed month. */
  month: Date
  /** Callback when user changes month. */
  onMonthChange: (month: Date) => void
  /** Selected start date (optional). */
  start: Date | null
  /** Selected end date (optional). */
  end: Date | null
  /** Callback when user selects a day. Used for range: first click = start, second = end. */
  onSelectDay: (date: Date) => void
  /** When provided, dates for which this returns true are disabled (e.g. for stress testing). */
  isDayDisabled?: (date: Date) => boolean
  /** Override for root data-testid (e.g. "calendar-start", "calendar-end" for dual calendar). */
  calendarTestId?: string
}

/**
 * Simple one-month calendar for range selection.
 * Click a day to set start; click another to set end (or same day for single-day range).
 */
export function SimpleCalendar({
  month,
  onMonthChange,
  start,
  end,
  onSelectDay,
  isDayDisabled,
  calendarTestId = 'calendar',
}: SimpleCalendarProps) {
  const locale = getDateLocale()
  const weekStartsOn = getWeekStartsOn()
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calStart = startOfWeek(monthStart, { weekStartsOn })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn })
  const weekdayHeaders = getWeekdayHeaders()

  const rows: Date[] = []
  let d = calStart
  while (d <= calEnd) {
    rows.push(d)
    d = addDays(d, 1)
  }

  const weeks: Date[][] = []
  for (let i = 0; i < rows.length; i += 7) {
    weeks.push(rows.slice(i, i + 7))
  }

  function inRange(date: Date): boolean {
    if (!start) return false
    if (!end) return isSameDay(date, start)
    const t = date.getTime()
    return t >= start.getTime() && t <= end.getTime()
  }

  return (
    <div data-testid={calendarTestId} role="application" aria-label="Calendar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(month, 1))}
          data-testid="calendar-prev-month"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span data-testid="calendar-month-label" style={{ minWidth: '8rem' }}>
          {format(month, 'MMMM yyyy', { locale })}
        </span>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          data-testid="calendar-next-month"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <table role="grid" aria-label="Calendar">
        <thead>
          <tr>
            {weekdayHeaders.map((day) => (
              <th key={day} scope="col" style={{ padding: '2px 4px', fontSize: '0.75rem' }}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, rowIdx) => (
            <tr key={rowIdx} role="row">
              {week.map((date) => {
                const inMonth = isSameMonth(date, month)
                const selected = start && isSameDay(date, start)
                const isEnd = end && isSameDay(date, end)
                const inRangeVal = inRange(date)
                const disabled = isDayDisabled?.(date) ?? false
                return (
                  <td
                    key={date.toISOString()}
                    role="gridcell"
                    data-testid="calendar-cell"
                    data-date={formatDate(date)}
                    data-disabled={disabled || undefined}
                    data-calendar-row={rowIdx}
                    data-calendar-col={week.indexOf(date)}
                    style={{
                      padding: 2,
                      opacity: inMonth ? 1 : 0.4,
                      backgroundColor: inRangeVal ? '#e0e0e0' : undefined,
                      fontWeight: selected || isEnd ? 'bold' : undefined,
                    }}
                  >
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && onSelectDay(date)}
                      style={{
                        width: '1.75rem',
                        height: '1.75rem',
                        border: '1px solid #ccc',
                        background: 'none',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        borderRadius: 2,
                        opacity: disabled ? 0.5 : 1,
                      }}
                      aria-label={`Choose ${formatDate(date)}`}
                      aria-disabled={disabled}
                    >
                      {format(date, 'd', { locale })}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
