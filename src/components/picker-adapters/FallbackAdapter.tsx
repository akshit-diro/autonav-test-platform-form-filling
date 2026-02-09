import { getDateFormatPattern, isIsoDateFormat } from '../../config/dateLocale'
import { formatDate, parseDate } from '../../config/dateLocale'
import type { PickerAdapterProps } from './types'

/**
 * Fallback when the picker library is not embedded (e.g. Angular, jQuery-only).
 * Renders native or text inputs so the user can still select dates and download.
 */
export function FallbackAdapter({
  mode,
  id,
  startDate,
  endDate = null,
  onChange,
  disabled = false,
}: PickerAdapterProps) {
  const startStr = startDate ? formatDate(startDate) : ''
  const endStr = endDate ? formatDate(endDate) : ''
  const pattern = getDateFormatPattern()

  const handleStartChange = (value: string) => {
    const d = value.trim() ? parseDate(value) : null
    if (d && !Number.isNaN(d.getTime())) onChange(d, mode === 'range' ? (endDate ?? null) : null)
    else onChange(null, mode === 'range' ? endDate : null)
  }

  const handleEndChange = (value: string) => {
    if (mode !== 'range') return
    const d = value.trim() ? parseDate(value) : null
    if (d && !Number.isNaN(d.getTime())) onChange(startDate, d)
    else onChange(startDate, null)
  }

  const inputType = isIsoDateFormat() ? 'date' : 'text'

  return (
    <div className="picker-adapter picker-adapter--fallback" data-testid="picker-adapter-fallback">
      <input
        type={inputType}
        id={id}
        value={startStr}
        onChange={(e) => handleStartChange(e.target.value)}
        placeholder={isIsoDateFormat() ? undefined : pattern}
        disabled={disabled}
        data-testid="fallback-picker-start"
      />
      {mode === 'range' && (
        <input
          type={inputType}
          value={endStr}
          onChange={(e) => handleEndChange(e.target.value)}
          placeholder={isIsoDateFormat() ? undefined : pattern}
          disabled={disabled}
          data-testid="fallback-picker-end"
        />
      )}
    </div>
  )
}
