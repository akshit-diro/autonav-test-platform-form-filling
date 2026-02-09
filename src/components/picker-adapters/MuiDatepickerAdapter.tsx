import { useMemo } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'
import type { PickerAdapterProps } from './types'
import { getDateLocale, getDateFormatPattern } from '../../config/dateLocale'

export function MuiDatepickerAdapter({
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
  const locale = useMemo(() => getDateLocale(), [])
  const format = useMemo(() => getDateFormatPattern(), [])

  const handleStartChange = (value: Date | null) => {
    if (mode === 'range') onChange(value, endDate ?? null)
    else onChange(value, null)
  }

  const handleEndChange = (value: Date | null) => {
    if (mode === 'range') onChange(startDate, value)
  }


  const content = (() => {
    if (mode === 'range') {
      return (
        <div className="picker-adapter__range" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {inline ? (
            <>
              <StaticDatePicker
                value={startDate}
                onChange={handleStartChange}
                disabled={disabled}
                minDate={minDate ?? undefined}
                maxDate={maxDate ?? undefined}
                slotProps={{ actionBar: { actions: [] } }}
                data-testid="mui-datepicker-start"
              />
              <StaticDatePicker
                value={endDate}
                onChange={handleEndChange}
                disabled={disabled}
                minDate={minDate ?? undefined}
                maxDate={maxDate ?? undefined}
                slotProps={{ actionBar: { actions: [] } }}
                data-testid="mui-datepicker-end"
              />
            </>
          ) : (
            <>
              <DatePicker
                label={placeholder ?? 'Start date'}
                value={startDate}
                onChange={handleStartChange}
                disabled={disabled}
                format={format}
                minDate={minDate ?? undefined}
                maxDate={maxDate ?? undefined}
                slotProps={{
                  textField: {
                    id,
                    size: 'small',
                    inputProps: { 'data-testid': 'mui-datepicker-start' },
                  },
                }}
              />
              <DatePicker
                label={placeholder ?? 'End date'}
                value={endDate}
                onChange={handleEndChange}
                disabled={disabled}
                format={format}
                minDate={startDate ?? minDate ?? undefined}
                maxDate={maxDate ?? undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    inputProps: { 'data-testid': 'mui-datepicker-end' },
                  },
                }}
              />
            </>
          )}
        </div>
      )
    }

    if (inline) {
      return (
        <StaticDatePicker
          value={startDate}
          onChange={handleStartChange}
          disabled={disabled}
          minDate={minDate ?? undefined}
          maxDate={maxDate ?? undefined}
          slotProps={{ actionBar: { actions: [] } }}
          data-testid="mui-datepicker-single"
        />
      )
    }

    return (
      <DatePicker
        label={placeholder ?? 'Select date'}
        value={startDate}
        onChange={handleStartChange}
        disabled={disabled}
        format={format}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        slotProps={{
          textField: {
            id,
            size: 'small',
            inputProps: { 'data-testid': 'mui-datepicker-single' },
          },
        }}
      />
    )
  })()

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
      <div className="picker-adapter picker-adapter--mui" data-testid="picker-adapter-mui">
        {content}
      </div>
    </LocalizationProvider>
  )
}
