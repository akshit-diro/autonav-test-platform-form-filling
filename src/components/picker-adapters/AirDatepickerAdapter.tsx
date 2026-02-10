import { useRef, useEffect } from 'react'
import AirDatepicker from 'air-datepicker'
import localeEn from 'air-datepicker/locale/en'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'
import 'air-datepicker/air-datepicker.css'

const DATE_FORMAT_TO_AIR: Record<string, string> = {
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function AirDatepickerAdapter({
  mode,
  inline = false,
  disabled = false,
  id,
  startDate,
  endDate = null,
  onChange,
  minDate,
  maxDate,
}: PickerAdapterProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const instanceRef = useRef<InstanceType<typeof AirDatepicker> | null>(null)
  const onChangeRef = useRef(onChange)
  const modeRef = useRef(mode)
  const startDateRef = useRef<Date | null>(startDate)
  const endDateRef = useRef<Date | null>(endDate)
  onChangeRef.current = onChange
  modeRef.current = mode
  startDateRef.current = startDate
  endDateRef.current = endDate

  useEffect(() => {
    const el = inputRef.current
    if (!el) return

    const selectedDates: Date[] = []
    if (startDate) selectedDates.push(startDate)
    if (mode === 'range' && endDate) selectedDates.push(endDate)

    const dp = new AirDatepicker(el, {
      locale: localeEn,
      range: mode === 'range',
      inline,
      dateFormat: DATE_FORMAT_TO_AIR[appConfig.dateFormat] ?? 'yyyy-MM-dd',
      selectedDates: selectedDates.length > 0 ? selectedDates : undefined,
      minDate: minDate ?? undefined,
      maxDate: maxDate ?? undefined,
      onSelect(payload: { date: Date | Date[] }) {
        const date = payload.date
        const arr = Array.isArray(date) ? date : [date]
        const onChangeFn = onChangeRef.current
        const currentMode = modeRef.current
        const currentStart = startDateRef.current
        const currentEnd = endDateRef.current
        if (arr.length === 0) {
          onChangeFn(null, null)
          return
        }
        if (currentMode === 'range') {
          // Library often passes [d, d] or inconsistent arrays. Use single clicked date
          // and current state: first click = start, second click = end.
          const clicked = arr[0]
          const hasTwoDistinctDays = arr.length >= 2 && !isSameCalendarDay(arr[0], arr[1])
          if (hasTwoDistinctDays) {
            const [a, b] = arr[0].getTime() <= arr[1].getTime() ? [arr[0], arr[1]] : [arr[1], arr[0]]
            onChangeFn(a, b)
          } else if (currentStart == null) {
            onChangeFn(clicked, null)
          } else if (currentEnd == null) {
            const start = currentStart.getTime() <= clicked.getTime() ? currentStart : clicked
            const end = currentStart.getTime() <= clicked.getTime() ? clicked : currentStart
            onChangeFn(start, end)
          } else {
            onChangeFn(clicked, null)
          }
        } else {
          onChangeFn(arr[0], null)
        }
      },
    })

    instanceRef.current = dp

    return () => {
      if (dp && typeof dp.destroy === 'function') dp.destroy()
      instanceRef.current = null
    }
  }, [mode, inline, minDate, maxDate])

  useEffect(() => {
    const dp = instanceRef.current
    if (!dp || typeof dp.selectDate !== 'function') return
    // Don't sync while picker is open: selectDate() moves the view to the selected month
    // and would prevent the user from changing month/year.
    if (dp.visible) return
    if (mode === 'range') {
      if (startDate && endDate) dp.selectDate([startDate, endDate], { silent: true })
      else if (startDate) dp.selectDate([startDate], { silent: true })
      else dp.clear({ silent: true })
    } else {
      if (startDate) dp.selectDate(startDate, { silent: true })
      else dp.clear({ silent: true })
    }
  }, [mode, startDate, endDate])

  return (
    <div className="picker-adapter picker-adapter--air-datepicker" data-testid="picker-adapter-air-datepicker">
      <input
        ref={inputRef}
        id={id}
        type="text"
        readOnly
        disabled={disabled}
        className="picker-adapter__input air-datepicker-input"
        data-air-datepicker
        data-testid="air-datepicker-input"
        aria-label={mode === 'range' ? 'Date range' : 'Date'}
      />
    </div>
  )
}
