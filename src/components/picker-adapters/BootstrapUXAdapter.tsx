import { useRef, useEffect, useCallback } from 'react'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'

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
  const startDateRef = useRef(startDate)
  /** When true, changeDate was triggered by our setDate/clearDates; skip calling onChange to avoid update loop. */
  const suppressChangeRef = useRef(false)
  onChangeRef.current = onChange
  modeRef.current = mode
  startDateRef.current = startDate

  const onEndChange = useCallback((date: Date | null) => {
    if (modeRef.current === 'range') onChangeRef.current(startDateRef.current, date)
  }, [])

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
        if (suppressChangeRef.current) {
          suppressChangeRef.current = false
          return
        }
        const d = $(this).datepicker('getDate') as Date | null
        const endEl = endRef.current
        const endVal = endEl && hasBootstrapDatepicker($(endEl)) ? ($(endEl).datepicker('getDate') as Date | null) : null
        if (modeRef.current === 'range') onChangeRef.current(d, endVal ?? null)
        else onChangeRef.current(d, null)
      })

      if (startDate) {
        suppressChangeRef.current = true
        $start.datepicker('setDate', startDate)
      }
    })

    return () => {
      cancelled = true
      const el = startRef.current
      if (el) getBootstrapDatepickerJQuery().then(($) => { if (hasBootstrapDatepicker($(el))) $(el).datepicker('destroy') })
    }
  // Do not include startDate or endDate: syncing/options are done in dedicated effects to avoid re-initing when user picks a date.
  }, [mode, disabled, minDate, maxDate])

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
        startDate: startDateRef.current ?? minDate ?? undefined,
        endDate: maxDate ?? undefined,
        autoclose: true,
      })
      $end.on('changeDate', function (this: HTMLElement) {
        if (suppressChangeRef.current) {
          suppressChangeRef.current = false
          return
        }
        const d = $(this).datepicker('getDate') as Date | null
        onEndChange(d)
      })

      if (endDate) {
        suppressChangeRef.current = true
        $end.datepicker('setDate', endDate)
      }
    })

    return () => {
      cancelled = true
      const el = endRef.current
      if (el) getBootstrapDatepickerJQuery().then(($) => { if (hasBootstrapDatepicker($(el))) $(el).datepicker('destroy') })
    }
  // Do not include startDate or endDate: use refs so picking end date does not re-run this effect and re-trigger changeDate.
  }, [mode, disabled, minDate, maxDate])

  // Update start picker's max (endDate) when endDate changes, without re-initing.
  useEffect(() => {
    if (mode !== 'range') return
    getBootstrapDatepickerJQuery().then(($) => {
      const startEl = startRef.current
      if (!startEl || !hasBootstrapDatepicker($(startEl))) return
      $(startEl).datepicker('setEndDate', endDate ?? maxDate ?? undefined)
    })
  }, [mode, endDate, maxDate])

  // Update end picker's min (startDate) when startDate changes, without re-initing.
  useEffect(() => {
    if (mode !== 'range') return
    getBootstrapDatepickerJQuery().then(($) => {
      const endEl = endRef.current
      if (!endEl || !hasBootstrapDatepicker($(endEl))) return
      $(endEl).datepicker('setStartDate', startDate ?? minDate ?? undefined)
    })
  }, [mode, startDate, minDate])

  useEffect(() => {
    getBootstrapDatepickerJQuery().then(($) => {
      const startEl = startRef.current
      if (!startEl || !hasBootstrapDatepicker($(startEl))) return
      const current = $(startEl).datepicker('getDate') as Date | null
      const same =
        startDate == null && current == null ||
        (startDate != null && current != null &&
          startDate.getFullYear() === current.getFullYear() &&
          startDate.getMonth() === current.getMonth() &&
          startDate.getDate() === current.getDate())
      if (same) return
      suppressChangeRef.current = true
      if (startDate) $(startEl).datepicker('setDate', startDate)
      else $(startEl).datepicker('clearDates')
    })
  }, [startDate])

  useEffect(() => {
    if (mode !== 'range') return
    getBootstrapDatepickerJQuery().then(($) => {
      const endEl = endRef.current
      if (!endEl || !hasBootstrapDatepicker($(endEl))) return
      const current = $(endEl).datepicker('getDate') as Date | null
      const same =
        endDate == null && current == null ||
        (endDate != null && current != null &&
          endDate.getFullYear() === current.getFullYear() &&
          endDate.getMonth() === current.getMonth() &&
          endDate.getDate() === current.getDate())
      if (same) return
      suppressChangeRef.current = true
      if (endDate) $(endEl).datepicker('setDate', endDate)
      else $(endEl).datepicker('clearDates')
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
        data-provide="datepicker"
        data-testid="bootstrap-ux-datepicker-input"
        autoComplete="off"
        disabled={disabled}
      />
    </div>
  )
}
