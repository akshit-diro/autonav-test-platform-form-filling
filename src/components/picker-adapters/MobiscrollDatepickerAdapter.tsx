import { useMemo, useCallback, useEffect, useState } from 'react'
import type { PickerAdapterProps } from './types'
import { appConfig } from '../../config/appConfig'
import { FallbackAdapter } from './FallbackAdapter'

/** Map app DATE_FORMAT to Mobiscroll dateFormat (display). */
const DATE_FORMAT_TO_MOBISCROLL: Record<string, string> = {
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
}

/**
 * Mobiscroll Datepicker adapter.
 * Dynamically loads @mobiscroll/react when available (e.g. from npm.mobiscroll.com).
 * If the package is not installed, renders FallbackAdapter so npm install succeeds without it.
 */
export function MobiscrollDatepickerAdapter(props: PickerAdapterProps) {
  const [Datepicker, setDatepicker] = useState<React.ComponentType<any> | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      import('@mobiscroll/react').catch(() => null),
      import('@mobiscroll/react/dist/css/mobiscroll.min.css').catch(() => {}),
    ]).then(([mod]) => {
      if (!cancelled && mod?.Datepicker) setDatepicker(() => mod.Datepicker)
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!loaded) {
    return (
      <div className="picker-adapter picker-adapter--mobiscroll" data-testid="picker-adapter-mobiscroll">
        <span className="picker-adapter__loading">Loading…</span>
      </div>
    )
  }

  if (!Datepicker) {
    return <FallbackAdapter {...props} />
  }

  return <MobiscrollDatepickerInner {...props} Datepicker={Datepicker} />
}

function MobiscrollDatepickerInner({
  Datepicker,
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
}: PickerAdapterProps & { Datepicker: React.ComponentType<any> }) {
  const dateFormat = useMemo(
    () => DATE_FORMAT_TO_MOBISCROLL[appConfig.dateFormat] ?? 'yyyy-MM-dd',
    []
  )

  const value = useMemo(() => {
    if (mode === 'range' && startDate != null && endDate != null) return [startDate, endDate]
    if (mode === 'range' && startDate != null) return [startDate]
    return startDate ?? null
  }, [mode, startDate, endDate])

  const handleChange = useCallback(
    (ev: { value?: Date | Date[] | null }) => {
      const v = ev.value
      if (v == null) {
        onChange(null, null)
        return
      }
      if (Array.isArray(v)) {
        onChange(v[0] ?? null, v[1] ?? null)
        return
      }
      onChange(v, null)
    },
    [onChange]
  )

  const commonProps = useMemo(
    () => ({
      value,
      onChange: handleChange,
      dateFormat,
      min: minDate ?? undefined,
      max: maxDate ?? undefined,
      disabled,
      display: inline ? ('inline' as const) : ('anchored' as const),
      inputProps: {
        id,
        placeholder: placeholder ?? (mode === 'range' ? 'Select start and end date' : 'Select date'),
        'data-testid': 'mobiscroll-datepicker-input',
        className: 'mbsc-input picker-adapter__input',
      },
    }),
    [value, handleChange, dateFormat, minDate, maxDate, disabled, inline, id, placeholder, mode]
  )

  if (mode === 'range') {
    return (
      <div
        className="picker-adapter picker-adapter--mobiscroll mbsc-datepicker"
        data-testid="picker-adapter-mobiscroll"
      >
        <Datepicker {...commonProps} select="range" controls={['calendar']} />
      </div>
    )
  }

  return (
    <div
      className="picker-adapter picker-adapter--mobiscroll mbsc-datepicker"
      data-testid="picker-adapter-mobiscroll"
    >
      <Datepicker {...commonProps} select="date" controls={['calendar']} />
    </div>
  )
}
