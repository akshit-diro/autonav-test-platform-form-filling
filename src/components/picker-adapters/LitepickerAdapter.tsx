import { useRef, useEffect, useCallback } from 'react'
import Litepicker from 'litepicker'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'

const DATE_FORMAT_TO_LITEPICKER: Record<string, string> = {
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'YYYY-MM-DD': 'YYYY-MM-DD',
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
      setup(p) {
        ;(p as unknown as { on: (ev: string, fn: (d1: { toJSDate?: () => Date } | null, d2: { toJSDate?: () => Date } | null) => void) => void }).on('selected', (date1, date2) => {
          const start = date1?.toJSDate?.() ?? null
          const end = date2?.toJSDate?.() ?? null
          handleSelect(start ?? null, end ?? null)
        })
      },
    })
    instanceRef.current = picker

    if (startDate) {
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
        className="picker-adapter__input"
        data-input
      />
    </div>
  )
}
