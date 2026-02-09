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
  onChangeRef.current = onChange
  modeRef.current = mode

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
        if (arr.length === 0) {
          onChangeFn(null, null)
          return
        }
        if (currentMode === 'range' && arr.length >= 2) {
          onChangeFn(arr[0], arr[1])
        } else if (currentMode === 'range') {
          onChangeFn(arr[0], null)
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
    if (mode === 'range') {
      if (startDate && endDate) dp.selectDate([startDate, endDate])
      else if (startDate) dp.selectDate([startDate])
      else dp.clear()
    } else {
      if (startDate) dp.selectDate(startDate)
      else dp.clear()
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
