import { useMemo, useState, useEffect, useCallback } from 'react'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { WheelColumn } from '../../components/WheelColumn'
import { stressConfig } from '../../config/stressConfig'
import { UX_DELAYS } from '../../config/uxDelays'
import { validateRange } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { delay } from '../../utils/delay'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'

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

/**
 * Mobile wheel / spinner picker. Day, month, year via scroll-only columns.
 * Selection updates only after scroll end (snap). Clicking does not select.
 */
export function MobileWheelScenario() {
  const [day, setDay] = useState(15)
  const [month, setMonth] = useState(6)
  const [year, setYear] = useState(new Date().getFullYear())
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([day, month, year])

  const resolvedDate = useMemo(() => {
    const d = clampDay(day, month, year)
    return new Date(year, month - 1, d)
  }, [day, month, year])

  const startInput = resolvedDate.toISOString().slice(0, 10)
  const endInput = startInput

  const validationResult = useMemo(
    () => validateRange(startInput, endInput),
    [startInput, endInput]
  )
  const valid = validationResult.valid

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

  return (
    <div>
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

      {!valid && validationResult.errors.length > 0 && (
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
          data-testid="download-pdf"
          data-validation-valid={validationResult.valid}
          data-validation-errors={validationResult.errorCodes || undefined}
          onClick={async () => {
            if (!downloadEnabled || !validationResult.range) return
            setGeneratingPdf(true)
            await delay(UX_DELAYS.SPINNER_BEFORE_PDF_MS)
            try {
              const { start, end } = validationResult.range
              const bytes = await generateDateRangeReport(start, end)
              downloadPdf(bytes)
            } finally {
              setGeneratingPdf(false)
            }
          }}
        >
          Download PDF
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
