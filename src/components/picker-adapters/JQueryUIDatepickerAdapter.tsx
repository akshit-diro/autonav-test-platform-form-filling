import { useRef, useEffect } from 'react'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'
import { formatDate } from '../../config/dateLocale'
import $ from 'jquery'
import './jquery-ui-bootstrap'
import 'jquery-ui-dist/jquery-ui'
import 'jquery-ui-dist/jquery-ui.css'

/** jQuery UI dateFormat option: map app DATE_FORMAT to jQuery format (dd, mm, yy). */
const DATE_FORMAT_TO_JQUERY_UI: Record<string, string> = {
  'DD/MM/YYYY': 'dd/mm/yy',
  'MM/DD/YYYY': 'mm/dd/yy',
  'YYYY-MM-DD': 'yy-mm-dd',
}

const jqueryUiDateFormat = DATE_FORMAT_TO_JQUERY_UI[appConfig.dateFormat] ?? 'yy-mm-dd'
const firstDay = appConfig.weekStart === 'Monday' ? 1 : 0

export function JQueryUIDatepickerAdapter({
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
  const onChangeRef = useRef(onChange)
  const modeRef = useRef(mode)
  onChangeRef.current = onChange
  modeRef.current = mode

  useEffect(() => {
    const startEl = startRef.current
    if (!startEl) return

    const $start = $(startEl)
    if ($start.hasClass('hasDatepicker')) $start.datepicker('destroy')

    $start.datepicker({
      dateFormat: jqueryUiDateFormat,
      firstDay,
      minDate: minDate ?? undefined,
      maxDate: mode === 'range' ? (endDate ?? maxDate ?? undefined) : (maxDate ?? undefined),
      onSelect() {
        const d = $start.datepicker('getDate') as Date | null
        const end = endRef.current ? ($(endRef.current).datepicker('getDate') as Date | null) : null
        if (modeRef.current === 'range') onChangeRef.current(d, end ?? null)
        else onChangeRef.current(d, null)
      },
      beforeShow: mode === 'range' && endRef.current
        ? function () {
            const $end = $(endRef.current!)
            if ($end.hasClass('hasDatepicker')) {
              const endDateVal = $end.datepicker('getDate') as Date | null
              return endDateVal ? { maxDate: endDateVal } : {}
            }
            return {}
          }
        : undefined,
    })

    if (disabled) $start.datepicker('disable')
    if (startDate) $start.datepicker('setDate', startDate)

    return () => {
      if (startRef.current && $(startRef.current).hasClass('hasDatepicker')) {
        $(startRef.current).datepicker('destroy')
      }
    }
  }, [mode, disabled, minDate, maxDate, endDate])

  useEffect(() => {
    if (mode !== 'range') return
    const endEl = endRef.current
    if (!endEl) return

    const $end = $(endEl)
    if ($end.hasClass('hasDatepicker')) $end.datepicker('destroy')

    $end.datepicker({
      dateFormat: jqueryUiDateFormat,
      firstDay,
      minDate: startDate ?? minDate ?? undefined,
      maxDate: maxDate ?? undefined,
      onSelect() {
        const d = $end.datepicker('getDate') as Date | null
        const start = startRef.current ? ($(startRef.current).datepicker('getDate') as Date | null) : null
        onChangeRef.current(start, d)
      },
    })

    if (disabled) $end.datepicker('disable')
    if (endDate) $end.datepicker('setDate', endDate)

    return () => {
      if (endRef.current && $(endRef.current).hasClass('hasDatepicker')) {
        $(endRef.current).datepicker('destroy')
      }
    }
  }, [mode, disabled, startDate, minDate, maxDate])

  useEffect(() => {
    const startEl = startRef.current
    if (startEl && $(startEl).hasClass('hasDatepicker')) {
      if (startDate) $(startEl).datepicker('setDate', startDate)
      else $(startEl).datepicker('setDate', null)
    }
  }, [startDate])

  useEffect(() => {
    if (mode !== 'range') return
    const endEl = endRef.current
    if (endEl && $(endEl).hasClass('hasDatepicker')) {
      if (endDate) $(endEl).datepicker('setDate', endDate)
      else $(endEl).datepicker('setDate', null)
    }
  }, [mode, endDate])

  if (mode === 'range') {
    return (
      <div className="picker-adapter picker-adapter--jquery-ui" data-testid="picker-adapter-jquery-ui">
        <div className="picker-adapter__range">
          <input
            ref={startRef}
            type="text"
            readOnly
            id={id}
            className="picker-adapter__input"
            placeholder="Start date"
            defaultValue={startDate ? formatDate(startDate) : ''}
            data-testid="jquery-ui-datepicker-start"
          />
          <input
            ref={endRef}
            type="text"
            readOnly
            className="picker-adapter__input"
            placeholder="End date"
            defaultValue={endDate ? formatDate(endDate) : ''}
            data-testid="jquery-ui-datepicker-end"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="picker-adapter picker-adapter--jquery-ui" data-testid="picker-adapter-jquery-ui">
      <input
        ref={startRef}
        type="text"
        readOnly
        id={id}
        className="picker-adapter__input"
        defaultValue={startDate ? formatDate(startDate) : ''}
        data-testid="jquery-ui-datepicker-input"
      />
    </div>
  )
}
