import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { WheelColumn } from '../../components/WheelColumn'
import { appConfig } from '../../config/appConfig'
import { stressConfig } from '../../config/stressConfig'
import { UX_DELAYS } from '../../config/uxDelays'
import { getBankThemeConfig } from '../../config/bankThemes'
import { DomNoiseDecorativeIcon } from '../../components/DomNoise'
import { validateRange } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { chaosDelay } from '../../utils/chaos'
import { formatDate, parseDate } from '../../config/dateLocale'
import { useAuth } from '../../auth/useAuth'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'
import { useFocusResetOnError } from '../../utils/useFocusResetOnError'
import { useValidationErrorDisplay } from '../../utils/useValidationErrorDisplay'
import { getLastDateRange, setLastDateRange } from '../../utils/stateLeakage'

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

function getYearOptions(): number[] {
  const current = new Date().getFullYear()
  return Array.from({ length: 11 }, (_, i) => current - 5 + i)
}

function clampDay(day: number, month: number, year: number): number {
  const max = daysInMonth(month, year)
  return Math.min(max, Math.max(1, day))
}

type DateParts = { day: number; month: number; year: number }

function datePartsFromString(iso: string | undefined): DateParts | null {
  if (!iso) return null
  const d = parseDate(iso)
  if (!d || Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  if (!getYearOptions().includes(y)) return null
  const m = d.getMonth() + 1
  return { day: d.getDate(), month: m, year: y }
}

function defaultDateParts(): DateParts {
  const y = new Date().getFullYear()
  return { day: 15, month: 6, year: y }
}

function initialStartEndFromLeakage(): { start: DateParts; end: DateParts } {
  const r = getLastDateRange()
  const start = datePartsFromString(r?.from) ?? defaultDateParts()
  const end = datePartsFromString(r?.to) ?? { ...start }
  const startClamped = { ...start, day: clampDay(start.day, start.month, start.year) }
  const endClamped = { ...end, day: clampDay(end.day, end.month, end.year) }
  return { start: startClamped, end: endClamped }
}

function datePartsToDate(p: DateParts): Date {
  const d = clampDay(p.day, p.month, p.year)
  return new Date(p.year, p.month - 1, d)
}

export type MobileWheelActiveField = 'start' | 'end'

/**
 * Mobile wheel / spinner picker for date range. Day, month, year via scroll-only columns.
 * User selects which date is being edited (Start or End); wheel updates only that date.
 * Selection updates only after scroll end (snap). Clicking does not select.
 */
export function MobileWheelScenario() {
  const initial = initialStartEndFromLeakage()
  const [startDate, setStartDate] = useState<DateParts>(initial.start)
  const [endDate, setEndDate] = useState<DateParts>(initial.end)
  const [activeField, setActiveField] = useState<MobileWheelActiveField>('start')
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([startDate, endDate, activeField])
  const focusResetRef = useRef<HTMLDivElement>(null)

  const resolvedStart = useMemo(() => datePartsToDate(startDate), [startDate])
  const resolvedEnd = useMemo(() => datePartsToDate(endDate), [endDate])

  useEffect(() => {
    if (!appConfig.enableStateLeakage) return
    setLastDateRange({ from: formatDate(resolvedStart), to: formatDate(resolvedEnd) })
  }, [resolvedStart, resolvedEnd])

  const startInput = formatDate(resolvedStart)
  const endInput = formatDate(resolvedEnd)

  const validationResult = useMemo(
    () => validateRange(startInput, endInput),
    [startInput, endInput]
  )
  const valid = validationResult.valid
  useFocusResetOnError(valid, focusResetRef)

  useEffect(() => {
    if (!valid) {
      setDownloadReady(false)
      return
    }
    if (!stressConfig.loadingSpinnerBeforeDownload) {
      setDownloadReady(true)
      return
    }
    setDownloadReady(false)
    const t = setTimeout(() => setDownloadReady(true), stressConfig.loadingSpinnerDurationMs)
    return () => clearTimeout(t)
  }, [valid])

  const downloadEnabled =
    valid &&
    !isCooldown &&
    !generatingPdf &&
    (!stressConfig.loadingSpinnerBeforeDownload || downloadReady)

  const dayOptions = useMemo(
    () => Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: String(i + 1) })),
    []
  )
  const monthOptions = useMemo(
    () => MONTH_LABELS.map((label, i) => ({ value: i + 1, label })),
    []
  )
  const yearOptions = useMemo(
    () => getYearOptions().map((y) => ({ value: y, label: String(y) })),
    []
  )

  const activeDate = activeField === 'start' ? startDate : endDate
  const setActiveDateRef = useRef<(fn: (prev: DateParts) => DateParts) => void>(() => {})
  setActiveDateRef.current = activeField === 'start' ? setStartDate : setEndDate

  const handleDaySelect = useCallback((v: number) => {
    setActiveDateRef.current((prev) => ({ ...prev, day: clampDay(v, prev.month, prev.year) }))
  }, [])
  const handleMonthSelect = useCallback((v: number) => {
    setActiveDateRef.current((prev) => ({
      ...prev,
      month: v,
      day: clampDay(prev.day, v, prev.year),
    }))
  }, [])
  const handleYearSelect = useCallback((v: number) => {
    setActiveDateRef.current((prev) => ({
      ...prev,
      year: v,
      day: clampDay(prev.day, prev.month, v),
    }))
  }, [])

  const hasValidationErrors = !valid && validationResult.errors.length > 0
  const showValidationErrors = useValidationErrorDisplay(hasValidationErrors)
  const { requireReauthBeforeSensitiveAction } = useAuth()

  return (
    <div>
      <div ref={focusResetRef} tabIndex={-1} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }} aria-hidden />
      <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        Choose Start Date or End Date, then scroll each column. The wheel edits only the selected field.
      </p>

      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, marginRight: '0.5rem' }}>Start:</span>
        <span data-testid="mobile-wheel-start-display" data-field="start">
          {startInput}
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, marginLeft: '1rem', marginRight: '0.5rem' }}>End:</span>
        <span data-testid="mobile-wheel-end-display" data-field="end">
          {endInput}
        </span>
      </div>

      <fieldset
        style={{ border: '1px solid #666', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem' }}
        data-testid="mobile-wheel-active-field-group"
        data-active-field={activeField}
      >
        <legend style={{ padding: '0 0.25rem', fontWeight: 600 }}>Editing</legend>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button
            type="button"
            data-testid="mobile-wheel-select-start"
            data-active={activeField === 'start'}
            aria-pressed={activeField === 'start'}
            aria-label="Edit Start Date"
            onClick={() => setActiveField('start')}
            style={{
              padding: '0.35rem 0.75rem',
              fontWeight: activeField === 'start' ? 700 : 400,
              background: activeField === 'start' ? '#e0f0ff' : '#f0f0f0',
              border: activeField === 'start' ? '2px solid #0066cc' : '1px solid #ccc',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Start Date
          </button>
          <button
            type="button"
            data-testid="mobile-wheel-select-end"
            data-active={activeField === 'end'}
            aria-pressed={activeField === 'end'}
            aria-label="Edit End Date"
            onClick={() => setActiveField('end')}
            style={{
              padding: '0.35rem 0.75rem',
              fontWeight: activeField === 'end' ? 700 : 400,
              background: activeField === 'end' ? '#e0f0ff' : '#f0f0f0',
              border: activeField === 'end' ? '2px solid #0066cc' : '1px solid #ccc',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            End Date
          </button>
        </div>
        <div
          data-testid="mobile-wheel-picker"
          data-active-field={activeField}
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <div data-testid="wheel-column-day">
            <WheelColumn
              options={dayOptions}
              selectedValue={activeDate.day}
              onSelect={handleDaySelect}
              data-testid="wheel-column-day"
            />
            <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: 2 }}>Day</div>
          </div>
          <div data-testid="wheel-column-month">
            <WheelColumn
              options={monthOptions}
              selectedValue={activeDate.month}
              onSelect={handleMonthSelect}
              data-testid="wheel-column-month"
            />
            <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: 2 }}>Month</div>
          </div>
          <div data-testid="wheel-column-year">
            <WheelColumn
              options={yearOptions}
              selectedValue={activeDate.year}
              onSelect={handleYearSelect}
              data-testid="wheel-column-year"
            />
            <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: 2 }}>Year</div>
          </div>
        </div>
        <p style={{ fontSize: '0.7rem', color: '#555', marginTop: '0.35rem', marginBottom: 0 }}>
          Active: <strong data-testid="mobile-wheel-active-label">{activeField === 'start' ? 'Start Date' : 'End Date'}</strong>
        </p>
      </fieldset>

      {showValidationErrors && (
        <div
          role="alert"
          data-testid="validation-errors"
          data-validation-errors={validationResult.errorCodes}
          className="form-error"
        >
          {validationResult.errors.map((e) => (
            <div key={e.code} data-testid={`validation-error-${e.code}`}>
              {e.message}
            </div>
          ))}
        </div>
      )}

      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <button
          type="button"
          disabled={!downloadEnabled}
          title={
            !appConfig.enableAntiPatterns && !downloadEnabled
              ? 'Select a valid date range to enable download'
              : undefined
          }
          data-testid="download-pdf"
          data-validation-valid={validationResult.valid}
          data-validation-errors={validationResult.errorCodes || undefined}
          onClick={async () => {
            if (!downloadEnabled || !validationResult.range) return
            const ok = await requireReauthBeforeSensitiveAction()
            if (!ok) return
            setGeneratingPdf(true)
            await chaosDelay(UX_DELAYS.SPINNER_BEFORE_PDF_MS)
            try {
              const { start, end } = validationResult.range
              const bytes = await generateDateRangeReport(start, end)
              downloadPdf(bytes)
            } finally {
              setGeneratingPdf(false)
            }
          }}
        >
          <DomNoiseDecorativeIcon type="download" />
          {getBankThemeConfig().downloadButtonLabel}
        </button>
        <LoadingSpinner
          visible={
            generatingPdf ||
            (valid && stressConfig.loadingSpinnerBeforeDownload && !downloadReady)
          }
        />
      </span>
    </div>
  )
}
