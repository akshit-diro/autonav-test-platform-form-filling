import { useRef, useEffect, useCallback } from 'react'
import Litepicker from 'litepicker'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'
import 'litepicker/dist/css/litepicker.css'

const DATE_FORMAT_TO_LITEPICKER: Record<string, string> = {
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'YYYY-MM-DD': 'YYYY-MM-DD',
}

/** Normalize Litepicker DateTime or native Date to Date | null. */
function toDate(value: unknown): Date | null {
  if (value == null) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof (value as { toJSDate?: () => Date }).toJSDate === 'function') {
    const d = (value as { toJSDate: () => Date }).toJSDate()
    return d && !Number.isNaN(d.getTime()) ? d : null
  }
  if (typeof (value as { getTime?: () => number }).getTime === 'function') {
    const d = new Date((value as { getTime: () => number }).getTime())
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

export function LitepickerAdapter({
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
  const instanceRef = useRef<InstanceType<typeof Litepicker> | null>(null)
  /** Skip calling onChange when we're syncing from props (setDate/setDateRange emit 'selected' and would loop). */
  const skipSelectedRef = useRef(false)

  const format = DATE_FORMAT_TO_LITEPICKER[appConfig.dateFormat] ?? 'YYYY-MM-DD'

  const handleSelect = useCallback(
    (start: Date | null, end: Date | null) => {
      if (mode === 'range') onChange(start, end)
      else onChange(start, null)
    },
    [mode, onChange]
  )

  useEffect(() => {
    const el = inputRef.current
    if (!el) return

    const picker = new Litepicker({
      element: el,
      singleMode: mode !== 'range',
      format,
      inlineMode: inline,
      minDate: minDate ?? undefined,
      maxDate: maxDate ?? undefined,
      autoApply: true,
      setup(pickerInstance: InstanceType<typeof Litepicker>) {
        // Litepicker extends EventEmitter at runtime; package types omit .on()
        ;(pickerInstance as unknown as { on(event: string, listener: (...args: unknown[]) => void): void }).on(
          'selected',
          (date1: unknown, date2?: unknown) => {
          if (skipSelectedRef.current) {
            skipSelectedRef.current = false
            return
          }
          const start = toDate(date1)
          const end = mode === 'range' ? toDate(date2) : null
          handleSelect(start, end)
        })
      },
    })
    instanceRef.current = picker

    if (startDate) {
      skipSelectedRef.current = true
      if (mode === 'range' && endDate) picker.setDateRange(startDate, endDate)
      else picker.setDate(startDate)
    }

    return () => {
      instanceRef.current = null
      if (picker && typeof picker.destroy === 'function') picker.destroy()
    }
  }, [mode, inline, format, minDate, maxDate, handleSelect])

  useEffect(() => {
    const picker = instanceRef.current
    if (!picker) return
    if (disabled) {
      picker.setOptions({ minDate: undefined, maxDate: undefined })
      inputRef.current?.setAttribute('disabled', 'true')
    } else {
      picker.setOptions({ minDate: minDate ?? undefined, maxDate: maxDate ?? undefined })
      inputRef.current?.removeAttribute('disabled')
    }
  }, [disabled, minDate, maxDate])

  useEffect(() => {
    const picker = instanceRef.current
    if (!picker) return
    skipSelectedRef.current = true
    if (mode === 'range' && startDate && endDate) picker.setDateRange(startDate, endDate)
    else if (startDate) picker.setDate(startDate)
    else picker.clearSelection()
  }, [mode, startDate, endDate])

  return (
    <div
      className="picker-adapter picker-adapter--litepicker"
      data-testid="picker-adapter-litepicker"
    >
      <input
        ref={inputRef}
        id={id}
        type="text"
        readOnly
        className="picker-adapter__input litepicker-input"
        data-litepicker
        data-input
      />
    </div>
  )
}
