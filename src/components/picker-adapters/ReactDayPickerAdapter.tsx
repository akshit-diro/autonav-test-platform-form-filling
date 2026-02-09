import { useCallback, useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import type { PickerAdapterProps } from './types'
import { getDateLocale } from '../../config/dateLocale'
import { getWeekStartsOn } from '../../config/dateLocale'
import 'react-day-picker/style.css'

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
        <DayPicker
          mode="range"
          required={false}
          selected={selected as DateRange | undefined}
          onSelect={handleSelect as (range: DateRange | undefined) => void}
          locale={locale}
          weekStartsOn={weekStartsOn}
          disabled={disabledMatcher}
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
      <DayPicker
        mode="single"
        required={false}
        selected={selected as Date | undefined}
        onSelect={handleSelect as (date: Date | undefined) => void}
        locale={locale}
        weekStartsOn={weekStartsOn}
        disabled={disabledMatcher}
      />
    </div>
  )
}
