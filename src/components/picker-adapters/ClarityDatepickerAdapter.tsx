import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
} from 'date-fns'
import type { PickerAdapterProps } from './types'
import { formatDate, getDateLocale, getWeekStartsOn } from '../../config/dateLocale'

/**
 * Clarity Datepicker (VMware) adapter.
 * Renders DOM that matches Clarity selectors (.clr-datepicker, .clr-input, input.clr-date-input, .day)
 * for picker detection. No fallback to native or other datepicker.
 */

const WEEK_DAYS = 7

function buildCalendarDays(month: Date, weekStartsOn: 0 | 1): Date[] {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calStart = startOfWeek(monthStart, { weekStartsOn })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn })
  const days: Date[] = []
  let d = calStart
  while (d <= calEnd) {
    days.push(d)
    d = addDays(d, 1)
  }
  return days
}

function ClarityCalendarBody({
  month,
  onMonthChange,
  startDate,
  endDate,
  onSelectDay,
  disabled,
  minDate,
  maxDate,
  mode,
}: {
  month: Date
  onMonthChange: (m: Date) => void
  startDate: Date | null
  endDate: Date | null
  onSelectDay: (d: Date) => void
  disabled: boolean
  minDate?: Date | null
  maxDate?: Date | null
  mode: 'single' | 'range'
}) {
  const locale = getDateLocale()
  const weekStartsOn = getWeekStartsOn()
  const days = useMemo(() => buildCalendarDays(month, weekStartsOn), [month, weekStartsOn])
  const weekHeaders = useMemo(() => {
    const base = new Date(2025, 0, 5 + weekStartsOn)
    return [0, 1, 2, 3, 4, 5, 6].map((i) => format(addDays(base, i), 'EEE', { locale }))
  }, [locale, weekStartsOn])

  const isDayDisabled = useCallback(
    (d: Date) => {
      if (disabled) return true
      if (minDate && isBefore(d, startOfMonth(minDate)) && !isSameMonth(d, minDate)) return true
      if (minDate && isSameMonth(d, minDate) && isBefore(d, minDate)) return true
      if (maxDate && isAfter(d, endOfMonth(maxDate)) && !isSameMonth(d, maxDate)) return true
      if (maxDate && isSameMonth(d, maxDate) && isAfter(d, maxDate)) return true
      return false
    },
    [disabled, minDate, maxDate]
  )

  const weeks = useMemo(() => {
    const w: Date[][] = []
    for (let i = 0; i < days.length; i += WEEK_DAYS) w.push(days.slice(i, i + WEEK_DAYS))
    return w
  }, [days])

  return (
    <div className="clr-datepicker-container" style={{ fontFamily: 'sans-serif', fontSize: 14 }}>
      <div
        className="clr-datepicker-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          gap: 8,
        }}
      >
        <button
          type="button"
          className="clr-datepicker-prev"
          aria-label="Previous month"
          onClick={() => onMonthChange(subMonths(month, 1))}
          style={{
            minWidth: 32,
            minHeight: 32,
            padding: 0,
            border: '1px solid #ccc',
            borderRadius: 4,
            background: '#fff',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ‹
        </button>
        <div className="clr-datepicker-month-year" style={{ fontWeight: 600 }}>
          {format(month, 'MMMM yyyy', { locale })}
        </div>
        <button
          type="button"
          className="clr-datepicker-next"
          aria-label="Next month"
          onClick={() => onMonthChange(addMonths(month, 1))}
          style={{
            minWidth: 32,
            minHeight: 32,
            padding: 0,
            border: '1px solid #ccc',
            borderRadius: 4,
            background: '#fff',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ›
        </button>
      </div>
      <table className="clr-datepicker-calendar" role="grid" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {weekHeaders.map((h) => (
              <th
                key={h}
                className="clr-datepicker-weekday"
                style={{ padding: '4px 2px', fontSize: 12, fontWeight: 500, color: '#666', textAlign: 'center' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((d) => {
                const isDisabled = isDayDisabled(d)
                const inRange =
                  mode === 'range' &&
                  startDate &&
                  (endDate
                    ? (d.getTime() >= startDate.getTime() && d.getTime() <= endDate.getTime())
                    : isSameDay(d, startDate))
                const isStart = startDate && isSameDay(d, startDate)
                const isEnd = endDate && isSameDay(d, endDate)
                const selected = (mode === 'single' && startDate && isSameDay(d, startDate)) || isStart || isEnd
                return (
                  <td key={d.getTime()} style={{ padding: 2, textAlign: 'center' }}>
                    <div
                      className="day"
                      role="button"
                      onClick={() => !isDisabled && onSelectDay(d)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          if (!isDisabled) onSelectDay(d)
                        }
                      }}
                      tabIndex={isDisabled ? -1 : 0}
                      style={{
                        minWidth: 32,
                        minHeight: 32,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        cursor: isDisabled ? 'default' : 'pointer',
                        background: selected ? '#007cba' : inRange ? 'rgba(0,124,186,0.15)' : 'transparent',
                        color: isDisabled ? '#999' : selected ? '#fff' : undefined,
                      }}
                    >
                      {format(d, 'd')}
                    </div>
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

function ClaritySingleOrRangePanel({
  mode,
  inline,
  startDate,
  endDate,
  onChange,
  disabled,
  minDate,
  maxDate,
  id,
  placeholder,
  openTriggerRef,
  rangeRole,
}: PickerAdapterProps & {
  openTriggerRef: React.RefObject<HTMLInputElement | null>
  rangeRole?: 'start' | 'end'
}) {
  const [open, setOpen] = useState(inline)
  const [viewMonth, setViewMonth] = useState(() => startDate ?? endDate ?? new Date())
  const panelRef = useRef<HTMLDivElement>(null)

  const handleSelectDay = useCallback(
    (d: Date) => {
      if (mode === 'range' && rangeRole === 'end') {
        onChange(startDate, d)
        if (!inline) setOpen(false)
      } else if (mode === 'range' && rangeRole === 'start') {
        onChange(d, null)
      } else if (mode === 'range') {
        if (!startDate || (startDate && endDate)) {
          onChange(d, null)
        } else {
          const from = startDate.getTime() <= d.getTime() ? startDate : d
          const to = startDate.getTime() <= d.getTime() ? d : startDate
          onChange(from, to)
          if (!inline) setOpen(false)
        }
      } else {
        onChange(d, null)
        if (!inline) setOpen(false)
      }
    },
    [mode, startDate, endDate, onChange, inline, rangeRole]
  )

  useEffect(() => {
    if (!open || inline) return
    const el = openTriggerRef.current
    if (!el) return
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (panelRef.current?.contains(target) || el.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open, inline, openTriggerRef])

  const displayValue =
    mode === 'range' && rangeRole === 'start'
      ? startDate
        ? formatDate(startDate)
        : ''
      : mode === 'range' && rangeRole === 'end'
        ? endDate
          ? formatDate(endDate)
          : ''
        : mode === 'range' && startDate && endDate
          ? `${formatDate(startDate)} – ${formatDate(endDate)}`
          : startDate
            ? formatDate(startDate)
            : ''

  const content = (
    <div
      className="clr-datepicker-panel"
      role="dialog"
      aria-modal="true"
      ref={panelRef}
      data-testid="clarity-datepicker-panel"
      style={{
        position: inline ? 'relative' : 'absolute',
        top: inline ? undefined : '100%',
        left: inline ? undefined : 0,
        marginTop: inline ? 0 : 4,
        zIndex: 9999,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: 280,
      }}
    >
      <ClarityCalendarBody
        month={viewMonth}
        onMonthChange={setViewMonth}
        startDate={startDate}
        endDate={endDate ?? null}
        onSelectDay={handleSelectDay}
        disabled={disabled ?? false}
        minDate={minDate}
        maxDate={maxDate}
        mode={mode}
      />
    </div>
  )

  if (inline) {
    return (
      <div className="picker-adapter__range" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {content}
      </div>
    )
  }

  return (
    <div className="clr-datepicker datepicker" style={{ position: 'relative' }}>
      <input
        ref={(el) => {
          (openTriggerRef as React.MutableRefObject<HTMLInputElement | null>).current = el
        }}
        type="text"
        id={id}
        className="clr-input clr-date-input"
        value={displayValue}
        readOnly
        placeholder={placeholder}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        data-testid="clarity-datepicker-input"
        style={{
          display: 'block',
          width: '100%',
          minWidth: 200,
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: 4,
          fontSize: 14,
        }}
      />
      {open && content}
    </div>
  )
}

export function ClarityDatepickerAdapter(props: PickerAdapterProps) {
  const {
    mode,
    inline = false,
    disabled = false,
    id,
    placeholder,
    startDate,
    endDate = null,
    onChange,
    minDate,
    maxDate,
  } = props

  const startTriggerRef = useRef<HTMLInputElement | null>(null)
  const endTriggerRef = useRef<HTMLInputElement | null>(null)

  if (mode === 'range' && !inline) {
    return (
      <div
        className="picker-adapter picker-adapter--clarity"
        data-testid="picker-adapter-clarity"
      >
        <div className="picker-adapter__range" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <ClaritySingleOrRangePanel
            {...props}
            mode="range"
            startDate={startDate}
            endDate={endDate}
            onChange={onChange}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            id={id ? `${id}-start` : undefined}
            placeholder={placeholder ?? 'Start date'}
            openTriggerRef={startTriggerRef}
            rangeRole="start"
          />
          <ClaritySingleOrRangePanel
            {...props}
            mode="range"
            startDate={startDate}
            endDate={endDate}
            onChange={onChange}
            disabled={disabled}
            minDate={startDate ?? minDate}
            maxDate={maxDate}
            id={id ? `${id}-end` : undefined}
            placeholder={placeholder ?? 'End date'}
            openTriggerRef={endTriggerRef}
            rangeRole="end"
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className="picker-adapter picker-adapter--clarity"
      data-testid="picker-adapter-clarity"
    >
      <ClaritySingleOrRangePanel
        {...props}
        mode={mode}
        inline={inline}
        startDate={startDate}
        endDate={endDate}
        onChange={onChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        id={id}
        placeholder={placeholder}
        openTriggerRef={startTriggerRef}
      />
    </div>
  )
}
