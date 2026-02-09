import { useRef, useEffect, useCallback } from 'react'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'
import { formatDate } from '../../config/dateLocale'

/** Bootstrap-datepicker format: map app DATE_FORMAT to bootstrap format (dd, mm, yyyy). */
const DATE_FORMAT_TO_BOOTSTRAP: Record<string, string> = {
  'DD/MM/YYYY': 'dd/mm/yyyy',
  'MM/DD/YYYY': 'mm/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-mm-dd',
}

const bootstrapDateFormat = DATE_FORMAT_TO_BOOTSTRAP[appConfig.dateFormat] ?? 'yyyy-mm-dd'
const weekStart = appConfig.weekStart === 'Monday' ? 1 : 0

/** Load jQuery and bootstrap-datepicker once; return $ with .datepicker(). */
let jqPromise: Promise<JQueryStatic> | null = null
function getBootstrapDatepickerJQuery(): Promise<JQueryStatic> {
  if (jqPromise) return jqPromise
  jqPromise = (async () => {
    const $ = (await import('jquery')).default
    if (typeof window !== 'undefined') {
      ;(window as unknown as { jQuery: typeof $; $: typeof $ }).jQuery = (window as unknown as { $: typeof $ }).$ = $
    }
    await import('bootstrap-datepicker')
    await import('bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.min.css')
    return $
  })()
  return jqPromise
}

/** Returns true if the element has an active bootstrap-datepicker instance (plugin adds .datepicker class to container). */
function hasBootstrapDatepicker($el: JQuery): boolean {
  return $el.data('datepicker') != null
}

export function BootstrapUXAdapter({
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

  const onEndChange = useCallback((date: Date | null) => {
    if (modeRef.current === 'range') onChangeRef.current(startDate, date)
  }, [startDate])

  useEffect(() => {
    let cancelled = false
    const startEl = startRef.current
    if (!startEl) return

    getBootstrapDatepickerJQuery().then(($) => {
      if (cancelled) return
      const $start = $(startEl)
      if (hasBootstrapDatepicker($start)) $start.datepicker('destroy')

      $start.datepicker({
        format: bootstrapDateFormat,
        weekStart,
        startDate: minDate ?? undefined,
        endDate: mode === 'range' ? (endDate ?? maxDate ?? undefined) : (maxDate ?? undefined),
        autoclose: true,
      })
      $start.on('changeDate', function (this: HTMLElement) {
        const d = $(this).datepicker('getDate') as Date | null
        const endEl = endRef.current
        const endVal = endEl && hasBootstrapDatepicker($(endEl)) ? ($(endEl).datepicker('getDate') as Date | null) : null
        if (modeRef.current === 'range') onChangeRef.current(d, endVal ?? null)
        else onChangeRef.current(d, null)
      })

      if (startDate) $start.datepicker('setDate', startDate)
    })

    return () => {
      cancelled = true
      const el = startRef.current
      if (el) getBootstrapDatepickerJQuery().then(($) => { if (hasBootstrapDatepicker($(el))) $(el).datepicker('destroy') })
    }
  }, [mode, disabled, minDate, maxDate, endDate, startDate])

  useEffect(() => {
    if (mode !== 'range') return
    let cancelled = false
    const endEl = endRef.current
    if (!endEl) return

    getBootstrapDatepickerJQuery().then(($) => {
      if (cancelled) return
      const $end = $(endEl)
      if (hasBootstrapDatepicker($end)) $end.datepicker('destroy')

      $end.datepicker({
        format: bootstrapDateFormat,
        weekStart,
        startDate: startDate ?? minDate ?? undefined,
        endDate: maxDate ?? undefined,
        autoclose: true,
      })
      $end.on('changeDate', function (this: HTMLElement) {
        const d = $(this).datepicker('getDate') as Date | null
        onEndChange(d)
      })

      if (endDate) $end.datepicker('setDate', endDate)
    })

    return () => {
      cancelled = true
      const el = endRef.current
      if (el) getBootstrapDatepickerJQuery().then(($) => { if (hasBootstrapDatepicker($(el))) $(el).datepicker('destroy') })
    }
  }, [mode, disabled, startDate, minDate, maxDate, onEndChange, endDate])

  useEffect(() => {
    getBootstrapDatepickerJQuery().then(($) => {
      const startEl = startRef.current
      if (startEl && hasBootstrapDatepicker($(startEl))) {
        if (startDate) $(startEl).datepicker('setDate', startDate)
        else $(startEl).datepicker('clearDates')
      }
    })
  }, [startDate])

  useEffect(() => {
    if (mode !== 'range') return
    getBootstrapDatepickerJQuery().then(($) => {
      const endEl = endRef.current
      if (endEl && hasBootstrapDatepicker($(endEl))) {
        if (endDate) $(endEl).datepicker('setDate', endDate)
        else $(endEl).datepicker('clearDates')
      }
    })
  }, [mode, endDate])

  if (mode === 'range') {
    return (
      <div className="picker-adapter picker-adapter--bootstrap-ux datepicker" data-testid="picker-adapter-bootstrap-ux">
        <div className="picker-adapter__range">
          <input
            ref={startRef}
            type="text"
            readOnly
            id={id}
            className="picker-adapter__input"
            placeholder="Start date"
            value={startDate ? formatDate(startDate) : ''}
            data-provide="datepicker"
            data-testid="bootstrap-ux-datepicker-start"
            autoComplete="off"
            disabled={disabled}
          />
          <input
            ref={endRef}
            type="text"
            readOnly
            className="picker-adapter__input"
            placeholder="End date"
            value={endDate ? formatDate(endDate) : ''}
            data-provide="datepicker"
            data-testid="bootstrap-ux-datepicker-end"
            autoComplete="off"
            disabled={disabled}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="picker-adapter picker-adapter--bootstrap-ux datepicker" data-testid="picker-adapter-bootstrap-ux">
      <input
        ref={startRef}
        type="text"
        readOnly
        id={id}
        className="picker-adapter__input"
        value={startDate ? formatDate(startDate) : ''}
        data-provide="datepicker"
        data-testid="bootstrap-ux-datepicker-input"
        autoComplete="off"
        disabled={disabled}
      />
    </div>
  )
}
