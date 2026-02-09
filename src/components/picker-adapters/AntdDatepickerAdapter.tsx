import { DatePicker } from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'
import dayjs, { type Dayjs } from 'dayjs'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'

const { RangePicker } = DatePicker

/** Map app DATE_FORMAT to dayjs format (same tokens). */
const DATE_FORMAT = appConfig.dateFormat

function toDayjs(d: Date | null): Dayjs | null {
  return d ? dayjs(d) : null
}

function toDate(d: Dayjs | null): Date | null {
  return d && d.isValid() ? d.toDate() : null
}

function disabledDate(min: Date | null | undefined, max: Date | null | undefined) {
  return (current: Dayjs) => {
    if (!current || !current.isValid()) return true
    if (min && current.isBefore(dayjs(min), 'day')) return true
    if (max && current.isAfter(dayjs(max), 'day')) return true
    return false
  }
}

export function AntdDatepickerAdapter({
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
  const handleSingleChange = (date: Dayjs | null) => {
    onChange(toDate(date), null)
  }

  const handleRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates == null) {
      onChange(null, null)
      return
    }
    const [start, end] = dates
    onChange(toDate(start), toDate(end ?? null))
  }

  const disabledDateFn = disabledDate(minDate, maxDate)

  if (mode === 'range') {
    const rangeValue: [Dayjs | null, Dayjs | null] | null = startDate
      ? [toDayjs(startDate), endDate ? toDayjs(endDate) : null]
      : null

    return (
      <div className="picker-adapter picker-adapter--antd" data-testid="picker-adapter-antd">
        <RangePicker
          id={id}
          value={rangeValue as [Dayjs, Dayjs] | [Dayjs, null] | null}
          onChange={handleRangeChange}
          format={DATE_FORMAT}
          disabled={disabled}
          placeholder={[placeholder ?? 'Start date', placeholder ?? 'End date']}
          disabledDate={disabledDateFn}
          allowClear
          className="picker-adapter__input"
          popupClassName="antd-datepicker-dropdown"
        />
      </div>
    )
  }

  return (
    <div className="picker-adapter picker-adapter--antd" data-testid="picker-adapter-antd">
      <DatePicker
        id={id}
        value={toDayjs(startDate)}
        onChange={handleSingleChange}
        format={DATE_FORMAT}
        disabled={disabled}
        placeholder={placeholder ?? 'Select date'}
        disabledDate={disabledDateFn}
        allowClear
        className="picker-adapter__input"
        popupClassName="antd-datepicker-dropdown"
      />
    </div>
  )
}
