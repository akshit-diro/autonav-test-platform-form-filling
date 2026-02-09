import { useMemo } from 'react'
import ReactDatePicker from 'react-datepicker'
import type { PickerAdapterProps } from './types'
import { getDateLocale } from '../../config/dateLocale'
import 'react-datepicker/dist/react-datepicker.css'

export function ReactDatepickerAdapter({
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
  const locale = getDateLocale()

  const handleStartChange = (d: Date | null) => {
    if (mode === 'range') onChange(d, endDate ?? null)
    else onChange(d, null)
  }

  const handleEndChange = (d: Date | null) => {
    if (mode === 'range') onChange(startDate, d)
  }

  const commonProps = useMemo(
    () => ({
      inline,
      disabled,
      maxDate: maxDate ?? undefined,
      locale,
      dateFormat: 'dd/MM/yyyy',
    }),
    [inline, disabled, maxDate, locale]
  )

  if (mode === 'range') {
    return (
      <div className="picker-adapter picker-adapter--react-datepicker" data-testid="picker-adapter-react-datepicker">
        <div className="picker-adapter__range">
          <ReactDatePicker
            id={id}
            selected={startDate}
            onChange={handleStartChange}
            selectsStart
            startDate={startDate ?? undefined}
            endDate={endDate ?? undefined}
            minDate={minDate ?? undefined}
            {...commonProps}
            data-testid="react-datepicker-start"
          />
          <ReactDatePicker
            selected={endDate}
            onChange={handleEndChange}
            selectsEnd
            startDate={startDate ?? undefined}
            endDate={endDate ?? undefined}
            minDate={startDate ?? minDate ?? undefined}
            {...commonProps}
            data-testid="react-datepicker-end"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="picker-adapter picker-adapter--react-datepicker" data-testid="picker-adapter-react-datepicker">
      <ReactDatePicker
        id={id}
        selected={startDate}
        onChange={handleStartChange}
        minDate={minDate ?? undefined}
        {...commonProps}
        data-testid="react-datepicker-single"
      />
    </div>
  )
}
