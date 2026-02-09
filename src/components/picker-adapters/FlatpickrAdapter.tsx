import { useRef, useEffect, useMemo, useCallback } from 'react'
import flatpickr from 'flatpickr'
import type { Instance } from 'flatpickr/dist/types/instance'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'
import 'flatpickr/dist/themes/light.css'

const DATE_FORMAT_TO_FLATPICKR: Record<string, string> = {
  'DD/MM/YYYY': 'd/m/Y',
  'MM/DD/YYYY': 'm/d/Y',
  'YYYY-MM-DD': 'Y-m-d',
}

export function FlatpickrAdapter({
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
  const instanceRef = useRef<Instance | null>(null)

  const value = useMemo(() => {
    if (mode === 'range' && startDate && endDate) return [startDate, endDate]
    if (mode === 'range' && startDate) return [startDate]
    return startDate ? startDate : undefined
  }, [mode, startDate, endDate])

  const handleChange = useCallback(
    (dates: Date[]) => {
      if (dates.length === 0) onChange(null, null)
      else if (mode === 'range' && dates.length >= 2) onChange(dates[0], dates[1])
      else if (mode === 'range') onChange(dates[0], null)
      else onChange(dates[0], null)
    },
    [mode, onChange]
  )

  useEffect(() => {
    const el = inputRef.current
    if (!el) return

    const fp = flatpickr(el, {
      mode: mode === 'range' ? 'range' : 'single',
      inline,
      dateFormat: DATE_FORMAT_TO_FLATPICKR[appConfig.dateFormat] ?? 'Y-m-d',
      disable: disabled ? [() => true] : undefined,
      minDate: minDate ?? undefined,
      maxDate: maxDate ?? undefined,
      onChange: (dates: Date[]) => handleChange(dates),
    })

    instanceRef.current = Array.isArray(fp) ? fp[0] : fp
    if (value !== undefined) {
      const inst = instanceRef.current
      if (inst && typeof inst.setDate === 'function') inst.setDate(value, false)
    }

    return () => {
      const inst = instanceRef.current
      instanceRef.current = null
      if (inst && typeof inst.destroy === 'function') inst.destroy()
    }
  }, [mode, inline, disabled, minDate, maxDate, handleChange])

  useEffect(() => {
    const inst = instanceRef.current
    if (inst && typeof inst.setDate === 'function' && value !== undefined) {
      inst.setDate(value, false)
    }
  }, [value])

  return (
    <div className="picker-adapter picker-adapter--flatpickr" data-testid="picker-adapter-flatpickr">
      <input
        ref={inputRef}
        id={id}
        type="text"
        readOnly
        className="picker-adapter__input"
        data-testid="flatpickr-input"
        data-input
      />
    </div>
  )
}
