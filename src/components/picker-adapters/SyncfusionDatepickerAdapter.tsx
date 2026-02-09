import { DatePickerComponent, DateRangePickerComponent } from '@syncfusion/ej2-react-calendars'
import type { ChangedEventArgs } from '@syncfusion/ej2-calendars'
import type { RangeEventArgs } from '@syncfusion/ej2-calendars'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'

import '@syncfusion/ej2-base/styles/material.css'
import '@syncfusion/ej2-buttons/styles/material.css'
import '@syncfusion/ej2-inputs/styles/material.css'
import '@syncfusion/ej2-popups/styles/material.css'
import '@syncfusion/ej2-react-calendars/styles/material.css'

/** Map app DATE_FORMAT to Syncfusion format (dd, MM, yyyy). */
const DATE_FORMAT_TO_SYNCFUSION: Record<string, string> = {
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
}

const format = DATE_FORMAT_TO_SYNCFUSION[appConfig.dateFormat] ?? 'yyyy-MM-dd'

export function SyncfusionDatepickerAdapter({
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
  const handleSingleChange = (args: ChangedEventArgs) => {
    onChange(args.value ?? null, null)
  }

  const handleRangeChange = (args: RangeEventArgs) => {
    if (!args.value) {
      onChange(null, null)
      return
    }
    const v = args.value
    if (Array.isArray(v)) {
      onChange(v[0] ?? null, v[1] ?? null)
    } else {
      onChange(v.start ?? null, v.end ?? null)
    }
  }

  if (mode === 'range') {
    return (
      <div className="picker-adapter picker-adapter--syncfusion" data-testid="picker-adapter-syncfusion">
        <DateRangePickerComponent
          id={id}
          startDate={startDate ?? undefined}
          endDate={endDate ?? undefined}
          change={handleRangeChange}
          format={format}
          min={minDate ?? undefined}
          max={maxDate ?? undefined}
          enabled={!disabled}
          placeholder={placeholder ?? 'Select start and end date'}
          showClearButton
          cssClass="picker-adapter__input e-datepicker"
        />
      </div>
    )
  }

  return (
    <div className="picker-adapter picker-adapter--syncfusion" data-testid="picker-adapter-syncfusion">
      <DatePickerComponent
        id={id}
        value={startDate ?? undefined}
        change={handleSingleChange}
        format={format}
        min={minDate ?? undefined}
        max={maxDate ?? undefined}
        enabled={!disabled}
        placeholder={placeholder ?? 'Select date'}
        showClearButton
        cssClass="picker-adapter__input e-datepicker"
      />
    </div>
  )
}
