import { useCallback, useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import type { PickerAdapterProps } from './types'
import { getDateLocale } from '../../config/dateLocale'
import { getWeekStartsOn } from '../../config/dateLocale'
import 'react-day-picker/style.css'

/** Ensures nav chevrons and selected-day highlight work in both document and shadow/iframe. */
const RDP_UI_FIX_STYLES = `
.picker-adapter--react-day-picker .rdp-chevron {
  width: 1.75rem;
  height: 1.75rem;
  min-width: 28px;
  min-height: 28px;
}
.picker-adapter--react-day-picker .rdp-selected .rdp-day_button {
  background-color: var(--rdp-accent-color, #2563eb);
  color: white;
}
`.trim()

/** Chevron icon with inline fill so it stays visible when CSS doesn't apply (e.g. shadow DOM). */
function ChevronIcon({
  size = 30,
  orientation = 'left',
  className,
  disabled,
}: {
  size?: number
  orientation?: 'left' | 'right' | 'up' | 'down'
  className?: string
  disabled?: boolean
}) {
  const fill = disabled ? 'currentColor' : 'currentColor'
  const opacity = disabled ? 0.5 : 1
  const points =
    orientation === 'up'
      ? '6.77 17 12.5 11.43 18.24 17 20 15.28 12.5 8 5 15.28'
      : orientation === 'down'
        ? '6.77 8 12.5 13.57 18.24 8 20 9.72 12.5 17 5 9.72'
        : orientation === 'left'
          ? '16 18.112 9.81111111 12 16 5.87733333 14.0888889 4 6 12 14.0888889 20'
          : '8 18.112 14.18888889 12 8 5.87733333 9.91111111 4 18 12 9.91111111 20'
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <polygon points={points} style={{ fill, opacity }} />
    </svg>
  )
}

export function ReactDayPickerAdapter({
  mode,
  disabled = false,
  id,
  startDate,
  endDate = null,
  onChange,
  minDate,
  maxDate,
}: PickerAdapterProps) {
  const locale = getDateLocale()
  const weekStartsOn = getWeekStartsOn()

  const selected = useMemo(() => {
    if (mode === 'range') {
      const from = startDate ?? undefined
      const to = endDate ?? undefined
      if (!from && !to) return undefined
      return { from, to } as DateRange
    }
    return startDate ?? undefined
  }, [mode, startDate, endDate])

  const handleSelect = useCallback(
    (value: Date | DateRange | undefined) => {
      if (mode === 'range') {
        const range = value as DateRange | undefined
        if (!range?.from) {
          onChange(null, null)
          return
        }
        onChange(range.from, range.to ?? null)
      } else {
        const d = value as Date | undefined
        onChange(d ?? null, null)
      }
    },
    [mode, onChange]
  )

  const disabledMatcher = useMemo(() => {
    if (disabled) return true
    const matchers: Array<(date: Date) => boolean> = []
    if (minDate) matchers.push((d) => d < minDate)
    if (maxDate) matchers.push((d) => d > maxDate)
    if (matchers.length === 0) return undefined
    return (date: Date) => matchers.some((m) => m(date))
  }, [disabled, minDate, maxDate])

  if (mode === 'range') {
    return (
      <div
        className="picker-adapter picker-adapter--react-day-picker"
        data-testid="picker-adapter-react-day-picker"
        id={id}
      >
        <style>{RDP_UI_FIX_STYLES}</style>
        <DayPicker
          mode="range"
          required={false}
          selected={selected as DateRange | undefined}
          onSelect={handleSelect as (range: DateRange | undefined) => void}
          locale={locale}
          weekStartsOn={weekStartsOn}
          disabled={disabledMatcher}
          components={{ Chevron: ChevronIcon }}
        />
      </div>
    )
  }
  return (
    <div
      className="picker-adapter picker-adapter--react-day-picker"
      data-testid="picker-adapter-react-day-picker"
      id={id}
    >
      <style>{RDP_UI_FIX_STYLES}</style>
      <DayPicker
        mode="single"
        required={false}
        selected={selected as Date | undefined}
        onSelect={handleSelect as (date: Date | undefined) => void}
        locale={locale}
        weekStartsOn={weekStartsOn}
        disabled={disabledMatcher}
        components={{ Chevron: ChevronIcon }}
      />
    </div>
  )
}
