import { useCallback } from 'react'
import { Calendar } from 'primereact/calendar'
import type { FormEvent } from 'primereact/ts-helpers'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'

/** Map app DATE_FORMAT to PrimeReact Calendar dateFormat (d, dd, m, mm, y, yy). */
const DATE_FORMAT_TO_PRIMENG: Record<string, string> = {
  'DD/MM/YYYY': 'dd/mm/yy',
  'MM/DD/YYYY': 'mm/dd/yy',
  'YYYY-MM-DD': 'yy-mm-dd',
}

export function PrimeNGDatepickerAdapter({
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
}: PickerAdapterProps) {
  const dateFormat = DATE_FORMAT_TO_PRIMENG[appConfig.dateFormat] ?? 'yy-mm-dd'

  const handleSingleChange = useCallback(
    (e: FormEvent<Date>): void => {
      onChange(e.value ?? null, null)
    },
    [onChange]
  )

  const handleRangeChange = useCallback(
    (e: FormEvent<(Date | null)[]>): void => {
      const v = e.value
      if (!v || v.length === 0) onChange(null, null)
      else if (v.length === 1) onChange(v[0] ?? null, null)
      else onChange(v[0] ?? null, v[1] ?? null)
    },
    [onChange]
  )

  if (mode === 'range') {
    const rangeValue: Date[] | null =
      startDate && endDate ? [startDate, endDate] : startDate ? [startDate] : null

    return (
      <div className="picker-adapter picker-adapter--primeng" data-testid="picker-adapter-primeng">
        {inline ? (
          <div className="picker-adapter__range" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <div className="picker-adapter__range-item" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="picker-adapter__range-label" aria-hidden="true">
                Start date
              </span>
              <Calendar
                value={startDate}
                onChange={(e: FormEvent<Date>) => onChange(e.value ?? null, endDate ?? null)}
                inline
                disabled={disabled}
                dateFormat={dateFormat}
                minDate={minDate ?? undefined}
                maxDate={maxDate ?? undefined}
                data-testid="primeng-datepicker-start"
                inputClassName="p-datepicker-input"
                aria-label="Start date"
              />
            </div>
            <div className="picker-adapter__range-item" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="picker-adapter__range-label" aria-hidden="true">
                End date
              </span>
              <Calendar
                value={endDate}
                onChange={(e: FormEvent<Date>) => onChange(startDate, e.value ?? null)}
                inline
                disabled={disabled}
                dateFormat={dateFormat}
                minDate={startDate ?? minDate ?? undefined}
                maxDate={maxDate ?? undefined}
                data-testid="primeng-datepicker-end"
                inputClassName="p-datepicker-input"
                aria-label="End date"
              />
            </div>
          </div>
        ) : (
          <div className="picker-adapter__range" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Calendar
              inputId={id}
              value={rangeValue}
              onChange={handleRangeChange}
              selectionMode="range"
              readOnlyInput
              hideOnRangeSelection
              disabled={disabled}
              dateFormat={dateFormat}
              minDate={minDate ?? undefined}
              maxDate={maxDate ?? undefined}
              placeholder={placeholder ?? 'Select start and end date'}
              className="p-datepicker-input"
              inputClassName="p-datepicker-input"
              data-testid="primeng-datepicker-range"
            />
          </div>
        )}
      </div>
    )
  }

  if (inline) {
    return (
      <div className="picker-adapter picker-adapter--primeng" data-testid="picker-adapter-primeng">
        <Calendar
          value={startDate}
          onChange={handleSingleChange}
          inline
          disabled={disabled}
          dateFormat={dateFormat}
          minDate={minDate ?? undefined}
          maxDate={maxDate ?? undefined}
          data-testid="primeng-datepicker-single"
          inputClassName="p-datepicker-input"
        />
      </div>
    )
  }

  return (
    <div className="picker-adapter picker-adapter--primeng" data-testid="picker-adapter-primeng">
      <Calendar
        inputId={id}
        value={startDate}
        onChange={handleSingleChange}
        readOnlyInput
        disabled={disabled}
        dateFormat={dateFormat}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        placeholder={placeholder ?? 'Select date'}
        className="p-datepicker-input"
        inputClassName="p-datepicker-input"
        data-testid="primeng-datepicker-single"
      />
    </div>
  )
}
