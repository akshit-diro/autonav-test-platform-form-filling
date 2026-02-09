import { DateBox } from 'devextreme-react/date-box'
import { DateRangeBox } from 'devextreme-react/date-range-box'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'

import 'devextreme/dist/css/dx.light.css'

/** Map app DATE_FORMAT to DevExpress displayFormat (LDML: dd, MM, yyyy). */
const DATE_FORMAT_TO_DEVEXPRESS: Record<string, string> = {
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
}

const displayFormat =
  DATE_FORMAT_TO_DEVEXPRESS[appConfig.dateFormat] ?? 'yyyy-MM-dd'

export function DevExpressDatepickerAdapter({
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
  const handleSingleChange = (e: { value?: Date | null }) => {
    onChange(e.value ?? null, null)
  }

  const handleRangeChange = (e: { value?: [Date, Date] | null }) => {
    const v = e.value
    if (!v || !Array.isArray(v)) {
      onChange(null, null)
      return
    }
    onChange(v[0] ?? null, v[1] ?? null)
  }

  if (mode === 'range') {
    return (
      <div
        className="picker-adapter picker-adapter--devextreme"
        data-testid="picker-adapter-devextreme"
      >
        <DateRangeBox
          id={id}
          value={[startDate ?? null, endDate ?? null] as [Date, Date]}
          onValueChanged={handleRangeChange}
          displayFormat={displayFormat}
          min={minDate ?? undefined}
          max={maxDate ?? undefined}
          disabled={disabled}
          labelMode="outside"
          startDateLabel={placeholder ?? 'Start date'}
          endDateLabel={placeholder ?? 'End date'}
          startDatePlaceholder=""
          endDatePlaceholder=""
          showClearButton
          openOnFieldClick
          data-testid="devextreme-daterangebox"
        />
      </div>
    )
  }

  return (
    <div
      className="picker-adapter picker-adapter--devextreme"
      data-testid="picker-adapter-devextreme"
    >
      <DateBox
        id={id}
        type="date"
        value={startDate ?? undefined}
        onValueChanged={handleSingleChange}
        displayFormat={displayFormat}
        min={minDate ?? undefined}
        max={maxDate ?? undefined}
        disabled={disabled}
        labelMode="outside"
        label={placeholder ?? 'Select date'}
        placeholder=""
        showClearButton
        openOnFieldClick
        data-testid="devextreme-datebox"
      />
    </div>
  )
}
