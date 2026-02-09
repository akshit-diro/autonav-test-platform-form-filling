import { useMemo } from 'react'
import { IonDatetime, setupIonicReact } from '@ionic/react'
import type { PickerAdapterProps } from './types'

// Do not import Ionic core/structure/typography CSS - they reset html/body and break the host page.
// ion-datetime uses Shadow DOM and carries its own styles; setupIonicReact() is enough for the component to work.
setupIonicReact()

function dateToIsoDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseIonicValue(
  v: string | string[] | null | undefined
): Date | null {
  const s = v == null ? null : Array.isArray(v) ? v[0] : v
  if (s == null || s === '') return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Ionic DateTime Picker adapter.
 * Renders ion-datetime (IonDatetime from @ionic/react) for picker detection.
 * No fallback to native or other datepicker.
 */
export function IonicDatetimeAdapter({
  mode,
  inline: _inline = false,
  disabled = false,
  id,
  startDate,
  endDate = null,
  onChange,
  minDate,
  maxDate,
}: PickerAdapterProps) {
  const startValue = useMemo(
    () => (startDate ? dateToIsoDateString(startDate) : undefined),
    [startDate]
  )
  const endValue = useMemo(
    () => (endDate ? dateToIsoDateString(endDate) : undefined),
    [endDate]
  )
  const minStr = useMemo(
    () => (minDate ? dateToIsoDateString(minDate) : undefined),
    [minDate]
  )
  const maxStr = useMemo(
    () => (maxDate ? dateToIsoDateString(maxDate) : undefined),
    [maxDate]
  )

  const handleStartChange = (
    e: { detail: { value?: string | string[] | null } }
  ) => {
    const d = parseIonicValue(e.detail?.value ?? null)
    if (mode === 'range') onChange(d, endDate ?? null)
    else onChange(d, null)
  }

  const handleEndChange = (
    e: { detail: { value?: string | string[] | null } }
  ) => {
    onChange(startDate, parseIonicValue(e.detail?.value ?? null))
  }

  const rangeWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 24,
    alignItems: 'flex-start',
  }
  const singleCalendarStyle: React.CSSProperties = {
    minWidth: 320,
    flex: '0 1 auto',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 6,
    fontSize: '0.875rem',
    fontWeight: 600,
  }

  const content =
    mode === 'range' ? (
      <div
        className="picker-adapter__range picker-adapter--ionic-range"
        style={rangeWrapperStyle}
      >
        <div style={singleCalendarStyle} data-testid="ionic-datetime-start-wrap">
          <label style={labelStyle} htmlFor="ionic-datetime-start">
            Start date
          </label>
          <IonDatetime
            id="ionic-datetime-start"
            presentation="date"
            value={startValue}
            onIonChange={handleStartChange}
            disabled={disabled}
            min={minStr}
            max={maxStr}
            showDefaultButtons={false}
            className="ion-datetime"
          />
        </div>
        <div style={singleCalendarStyle} data-testid="ionic-datetime-end-wrap">
          <label style={labelStyle} htmlFor="ionic-datetime-end">
            End date
          </label>
          <IonDatetime
            id="ionic-datetime-end"
            presentation="date"
            value={endValue}
            onIonChange={handleEndChange}
            disabled={disabled}
            min={minStr}
            max={maxStr}
            showDefaultButtons={false}
            className="ion-datetime"
          />
        </div>
      </div>
    ) : (
      <div style={{ display: 'inline-block', minWidth: 320 }}>
        <label style={labelStyle} htmlFor={id ?? 'ionic-datetime-single'}>
          Date
        </label>
        <IonDatetime
          presentation="date"
          value={startValue}
          onIonChange={handleStartChange}
          disabled={disabled}
          min={minStr}
          max={maxStr}
          showDefaultButtons={false}
          id={id ?? 'ionic-datetime-single'}
          data-testid="ionic-datetime-single"
          className="ion-datetime"
        />
      </div>
    )

  return (
    <div
      className="picker-adapter picker-adapter--ionic"
      data-testid="picker-adapter-ionic"
    >
      {content}
    </div>
  )
}
