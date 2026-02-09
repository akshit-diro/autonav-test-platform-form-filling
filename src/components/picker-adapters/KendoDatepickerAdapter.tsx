import { DatePicker } from '@progress/kendo-react-dateinputs'
import type { PickerAdapterProps } from './types'
import { getDateFormatPattern } from '../../config/dateLocale'
import '@progress/kendo-theme-default/dist/all.css'

export function KendoDatepickerAdapter({
  mode,
  disabled = false,
  id,
  placeholder,
  startDate,
  endDate = null,
  onChange,
  minDate,
  maxDate,
}: PickerAdapterProps) {
  const format = getDateFormatPattern()

  const handleStartChange = (e: { value: Date | null }) => {
    if (mode === 'range') onChange(e.value ?? null, endDate ?? null)
    else onChange(e.value ?? null, null)
  }

  const handleEndChange = (e: { value: Date | null }) => {
    if (mode === 'range') onChange(startDate, e.value ?? null)
  }

  if (mode === 'range') {
    return (
      <div className="picker-adapter picker-adapter--kendo" data-testid="picker-adapter-kendo">
        <div className="picker-adapter__range" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <DatePicker
            id={id}
            value={startDate}
            onChange={handleStartChange}
            format={format}
            placeholder={placeholder ?? 'Start date'}
            disabled={disabled}
            min={minDate ?? undefined}
            max={maxDate ?? undefined}
            data-testid="kendo-datepicker-start"
          />
          <DatePicker
            value={endDate}
            onChange={handleEndChange}
            format={format}
            placeholder={placeholder ?? 'End date'}
            disabled={disabled}
            min={startDate ?? minDate ?? undefined}
            max={maxDate ?? undefined}
            data-testid="kendo-datepicker-end"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="picker-adapter picker-adapter--kendo" data-testid="picker-adapter-kendo">
      <DatePicker
        id={id}
        value={startDate}
        onChange={handleStartChange}
        format={format}
        placeholder={placeholder ?? 'Select date'}
        disabled={disabled}
        min={minDate ?? undefined}
        max={maxDate ?? undefined}
        data-testid="kendo-datepicker-single"
      />
    </div>
  )
}
