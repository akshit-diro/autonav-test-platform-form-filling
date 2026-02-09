import { useRef, useEffect, useCallback } from 'react'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'

/** Map app DATE_FORMAT to moment.js format (same token set). */
const DATE_FORMAT_TO_MOMENT: Record<string, string> = {
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'YYYY-MM-DD': 'YYYY-MM-DD',
}

const momentDateFormat = DATE_FORMAT_TO_MOMENT[appConfig.dateFormat] ?? 'YYYY-MM-DD'
const firstDay = appConfig.weekStart === 'Monday' ? 1 : 0

let jqPromise: Promise<JQueryStatic> | null = null
function getJQuery(): Promise<JQueryStatic> {
  if (jqPromise) return jqPromise
  jqPromise = (async () => {
    const $ = (await import('jquery')).default
    if (typeof window !== 'undefined') {
      ;(window as unknown as { jQuery: typeof $; $: typeof $ }).jQuery = (window as unknown as { $: typeof $ }).$ = $
    }
    const moment = (await import('moment')).default
    if (typeof window !== 'undefined') {
      ;(window as unknown as { moment: typeof moment }).moment = moment
    }
    await import('daterangepicker')
    await import('daterangepicker/daterangepicker.css')
    return $
  })()
  return jqPromise
}

export function DateRangePickerAdapter({
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
  const inputRef = useRef<HTMLInputElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const handleApply = useCallback((start: { toDate: () => Date }, end: { toDate: () => Date }) => {
    const startDateObj = start && typeof start.toDate === 'function' ? start.toDate() : (start as unknown as Date)
    const endDateObj = end && typeof end.toDate === 'function' ? end.toDate() : (end as unknown as Date)
    if (mode === 'range') {
      onChangeRef.current(startDateObj, endDateObj)
    } else {
      onChangeRef.current(startDateObj, null)
    }
  }, [mode])

  useEffect(() => {
    let cancelled = false
    const el = inputRef.current
    if (!el) return

    getJQuery().then(($) => {
      if (cancelled) return
      const $el = $(el)
      const existing = $el.data('daterangepicker')
      if (existing && typeof existing.remove === 'function') existing.remove()

      const start = startDate ?? new Date()
      const end = mode === 'range' && endDate ? endDate : startDate ?? new Date()

      $el.daterangepicker(
        {
          startDate: start,
          endDate: end,
          minDate: minDate ?? undefined,
          maxDate: maxDate ?? undefined,
          singleDatePicker: mode === 'single',
          autoUpdateInput: true,
          locale: {
            format: momentDateFormat,
            firstDay,
          },
        },
        (startMoment: { toDate: () => Date }, endMoment: { toDate: () => Date }) => {
          handleApply(startMoment, endMoment)
        }
      )

      const picker = $el.data('daterangepicker')
      if (picker && disabled) {
        if (typeof picker.disable === 'function') picker.disable()
      }
    })

    return () => {
      cancelled = true
      if (el) {
        getJQuery().then(($) => {
          const $el = $(el)
          const existing = $el.data('daterangepicker')
          if (existing && typeof existing.remove === 'function') existing.remove()
        })
      }
    }
  }, [mode, disabled, minDate, maxDate, handleApply])

  useEffect(() => {
    getJQuery().then(($) => {
      const el = inputRef.current
      if (!el) return
      const picker = $(el).data('daterangepicker')
      if (!picker || typeof picker.setStartDate !== 'function') return
      if (startDate) picker.setStartDate(startDate)
      if (mode === 'range' && endDate && typeof picker.setEndDate === 'function') picker.setEndDate(endDate)
    })
  }, [mode, startDate, endDate])

  const inputPlaceholder =
    placeholder ?? (mode === 'range' ? 'Select start and end date' : 'Select date')

  return (
    <div className="picker-adapter picker-adapter--daterangepicker" data-testid="picker-adapter-daterangepicker">
      <input
        ref={inputRef}
        type="text"
        id={id}
        name="daterangepicker"
        readOnly
        placeholder={inputPlaceholder}
        className="picker-adapter__input daterangepicker-input"
        data-testid="daterangepicker-input"
        disabled={disabled}
      />
    </div>
  )
}
