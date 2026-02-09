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
 * Angular Material Datepicker adapter.
 * Renders DOM that matches Angular Material selectors (.mat-datepicker-content, .mat-calendar,
 * input[matDatepicker], .mat-calendar-body-cell) for picker detection. No native/HTML datepicker fallback.
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

function MatCalendarBody({
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
    <div className="mat-calendar">
      <div className="mat-calendar-header">
        <button
          type="button"
          className="mat-calendar-previous-button"
          aria-label="Previous month"
          onClick={() => onMonthChange(subMonths(month, 1))}
        />
        <div className="mat-calendar-period-button">
          {format(month, 'MMMM yyyy', { locale })}
        </div>
        <button
          type="button"
          className="mat-calendar-next-button"
          aria-label="Next month"
          onClick={() => onMonthChange(addMonths(month, 1))}
        />
      </div>
      <div className="mat-calendar-body">
        <div className="mat-calendar-body-label" aria-hidden>
          {format(month, 'MMMM yyyy', { locale })}
        </div>
        <table className="mat-calendar-table" role="grid">
          <thead>
            <tr>
              {weekHeaders.map((h) => (
                <th key={h} className="mat-calendar-body-label">
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
                    <td
                      key={d.getTime()}
                      className={
                        'mat-calendar-body-cell' +
                        (isDisabled ? ' mat-calendar-body-disabled' : '') +
                        (selected ? ' mat-calendar-body-selected' : '') +
                        (inRange ? ' mat-calendar-body-range' : '')
                      }
                      role="gridcell"
                    >
                      <div
                        className="mat-calendar-body-cell-content"
                        onClick={() => !isDisabled && onSelectDay(d)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            if (!isDisabled) onSelectDay(d)
                          }
                        }}
                        tabIndex={isDisabled ? -1 : 0}
                        role="button"
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
    </div>
  )
}

function SingleOrRangePanel({
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
      className="mat-datepicker-content"
      role="dialog"
      aria-modal="true"
      ref={panelRef}
      data-testid="angular-material-datepicker-panel"
    >
      <MatCalendarBody
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
    <div className="picker-adapter__mat-wrapper" style={{ position: 'relative' }}>
      <input
        ref={(el) => {
          (openTriggerRef as React.MutableRefObject<HTMLInputElement | null>).current = el
          if (el) el.setAttribute('matDatepicker', '')
        }}
        type="text"
        id={id}
        className="mat-datepicker-input"
        value={displayValue}
        readOnly
        placeholder={placeholder}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        data-testid="angular-material-datepicker-input"
      />
      {open && content}
    </div>
  )
}

export function AngularMaterialAdapter(props: PickerAdapterProps) {
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
        className="picker-adapter picker-adapter--angular-material"
        data-testid="picker-adapter-angular-material"
      >
        <div className="picker-adapter__range" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <SingleOrRangePanel
            {...props}
            mode="range"
            startDate={startDate}
            endDate={endDate}
            onChange={onChange}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            id={id}
            placeholder={placeholder ?? 'Start date'}
            openTriggerRef={startTriggerRef}
            rangeRole="start"
          />
          <SingleOrRangePanel
            {...props}
            mode="range"
            startDate={startDate}
            endDate={endDate}
            onChange={onChange}
            disabled={disabled}
            minDate={startDate ?? minDate}
            maxDate={maxDate}
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
      className="picker-adapter picker-adapter--angular-material"
      data-testid="picker-adapter-angular-material"
    >
      <SingleOrRangePanel
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
