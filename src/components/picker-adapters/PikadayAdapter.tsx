import { useRef, useEffect, useCallback } from 'react'
import Pikaday from 'pikaday'
import type { PickerAdapterProps } from './types'
import { formatDate } from '../../config/dateLocale'
import 'pikaday/css/pikaday.css'

/** Pikaday is single-date only; for range we use two instances. */
export function PikadayAdapter({
  mode,
  disabled = false,
  id,
  startDate,
  endDate = null,
  onChange,
  minDate,
  maxDate,
}: PickerAdapterProps) {
  const startRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLInputElement>(null)
  const pickerStartRef = useRef<InstanceType<typeof Pikaday> | null>(null)
  const pickerEndRef = useRef<InstanceType<typeof Pikaday> | null>(null)

  const onStartSelect = useCallback(
    (date: Date | null) => {
      if (mode === 'range') onChange(date, endDate ?? null)
      else onChange(date, null)
    },
    [mode, endDate, onChange]
  )
  const onEndSelect = useCallback(
    (date: Date | null) => {
      if (mode === 'range') onChange(startDate, date)
    },
    [startDate, onChange]
  )

  useEffect(() => {
    const startEl = startRef.current
    if (!startEl) return

    const pickerStart = new Pikaday({
      field: startEl,
      minDate: minDate ?? undefined,
      maxDate: maxDate ?? undefined,
      onSelect(date: Date | null) {
        onStartSelect(date ?? null)
      },
    })
    pickerStartRef.current = pickerStart
    if (startDate) pickerStart.setDate(startDate, true)

    if (disabled) startEl.setAttribute('disabled', 'true')

    return () => {
      pickerStartRef.current = null
      if (pickerStart && typeof pickerStart.destroy === 'function') pickerStart.destroy()
    }
  }, [mode, disabled, minDate, maxDate, onStartSelect])

  useEffect(() => {
    if (mode !== 'range') return
    const endEl = endRef.current
    if (!endEl) return

    const pickerEnd = new Pikaday({
      field: endEl,
      minDate: startDate ?? minDate ?? undefined,
      maxDate: maxDate ?? undefined,
      onSelect(date: Date | null) {
        onEndSelect(date ?? null)
      },
    })
    pickerEndRef.current = pickerEnd
    if (endDate) pickerEnd.setDate(endDate, true)

    if (disabled) endEl.setAttribute('disabled', 'true')

    return () => {
      pickerEndRef.current = null
      if (pickerEnd && typeof pickerEnd.destroy === 'function') pickerEnd.destroy()
    }
  }, [mode, disabled, startDate, minDate, maxDate, onEndSelect])

  useEffect(() => {
    const ps = pickerStartRef.current
    if (ps && startDate) ps.setDate(startDate, true)
    else if (ps) ps.setDate(null, true)
  }, [startDate])

  useEffect(() => {
    const pe = pickerEndRef.current
    if (pe && endDate) pe.setDate(endDate, true)
    else if (pe) pe.setDate(null, true)
  }, [endDate])

  if (mode === 'range') {
    return (
      <div className="picker-adapter picker-adapter--pikaday" data-testid="picker-adapter-pikaday">
        <div className="picker-adapter__range">
          <input
            ref={startRef}
            type="text"
            readOnly
            id={id}
            className="picker-adapter__input"
            placeholder="Start date"
            value={startDate ? formatDate(startDate) : ''}
            data-testid="pikaday-start"
          />
          <input
            ref={endRef}
            type="text"
            readOnly
            className="picker-adapter__input"
            placeholder="End date"
            value={endDate ? formatDate(endDate) : ''}
            data-testid="pikaday-end"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="picker-adapter picker-adapter--pikaday" data-testid="picker-adapter-pikaday">
      <input
        ref={startRef}
        type="text"
        readOnly
        id={id}
        className="picker-adapter__input"
        value={startDate ? formatDate(startDate) : ''}
        data-testid="pikaday-input"
      />
    </div>
  )
}
