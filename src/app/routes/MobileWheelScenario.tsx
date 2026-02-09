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

function initialWheelFromLeakage(): { day: number; month: number; year: number } {
  const r = getLastDateRange()
  if (!r?.from) return { day: 15, month: 6, year: new Date().getFullYear() }
  const d = parseDate(r.from)
  if (!d || Number.isNaN(d.getTime())) return { day: 15, month: 6, year: new Date().getFullYear() }
  const y = d.getFullYear()
  const yearOpts = getYearOptions()
  if (!yearOpts.includes(y)) return { day: 15, month: 6, year: new Date().getFullYear() }
  return {
    day: clampDay(d.getDate(), d.getMonth() + 1, y),
    month: d.getMonth() + 1,
    year: y,
  }
}

/**
 * Mobile wheel / spinner picker. Day, month, year via scroll-only columns.
 * Selection updates only after scroll end (snap). Clicking does not select.
 */
export function MobileWheelScenario() {
  const initial = initialWheelFromLeakage()
  const [day, setDay] = useState(initial.day)
  const [month, setMonth] = useState(initial.month)
  const [year, setYear] = useState(initial.year)
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([day, month, year])
  const focusResetRef = useRef<HTMLDivElement>(null)

  const resolvedDate = useMemo(() => {
    const d = clampDay(day, month, year)
    return new Date(year, month - 1, d)
  }, [day, month, year])

  useEffect(() => {
    if (!appConfig.enableStateLeakage) return
    const d = resolvedDate
    const s = formatDate(d)
    setLastDateRange({ from: s, to: s })
  }, [resolvedDate])

  const startInput = formatDate(resolvedDate)
  const endInput = startInput

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

  const handleDaySelect = useCallback((v: number) => setDay(v), [])
  const handleMonthSelect = useCallback((v: number) => {
    setMonth(v)
    setDay((d) => clampDay(d, v, year))
  }, [year])
  const handleYearSelect = useCallback((v: number) => {
    setYear(v)
    setDay((d) => clampDay(d, month, v))
  }, [month])

  const hasValidationErrors = !valid && validationResult.errors.length > 0
  const showValidationErrors = useValidationErrorDisplay(hasValidationErrors)
  const { requireReauthBeforeSensitiveAction } = useAuth()

  return (
    <div>
      <div ref={focusResetRef} tabIndex={-1} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }} aria-hidden />
      <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        Scroll each column to select. Clicking does not change the value.
      </p>
      <div
        data-testid="mobile-wheel-picker"
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div data-testid="wheel-column-day">
          <WheelColumn
            options={dayOptions}
            selectedValue={day}
            onSelect={handleDaySelect}
            data-testid="wheel-column-day"
          />
          <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: 2 }}>Day</div>
        </div>
        <div data-testid="wheel-column-month">
          <WheelColumn
            options={monthOptions}
            selectedValue={month}
            onSelect={handleMonthSelect}
            data-testid="wheel-column-month"
          />
          <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: 2 }}>Month</div>
        </div>
        <div data-testid="wheel-column-year">
          <WheelColumn
            options={yearOptions}
            selectedValue={year}
            onSelect={handleYearSelect}
            data-testid="wheel-column-year"
          />
          <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: 2 }}>Year</div>
        </div>
      </div>

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
