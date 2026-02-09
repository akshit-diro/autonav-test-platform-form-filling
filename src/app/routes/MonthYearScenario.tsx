import { useMemo, useState, useEffect } from 'react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { stressConfig } from '../../config/stressConfig'
import { UX_DELAYS } from '../../config/uxDelays'
import { validateRange } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { delay } from '../../utils/delay'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getYearOptions(): number[] {
  const current = new Date().getFullYear()
  const from = current - 5
  return Array.from({ length: 6 }, (_, i) => from + i)
}

/**
 * Month & year picker. No day-level UI; selecting month resolves to full month range.
 * Validation applies (e.g. months with 31 days exceed max range).
 */
export function MonthYearScenario() {
  const [selectedYear, setSelectedYear] = useState<number | ''>('')
  const [selectedMonth, setSelectedMonth] = useState<number | ''>('')
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([selectedYear, selectedMonth])

  const range = useMemo(() => {
    if (selectedYear === '' || selectedMonth === '') return null
    const d = new Date(selectedYear, selectedMonth - 1, 1)
    return {
      start: startOfMonth(d),
      end: endOfMonth(d),
    }
  }, [selectedYear, selectedMonth])

  const startInput = range ? range.start.toISOString().slice(0, 10) : ''
  const endInput = range ? range.end.toISOString().slice(0, 10) : ''

  const validationResult = useMemo(
    () => validateRange(startInput, endInput),
    [startInput, endInput]
  )
  const resolvedStart = validationResult.range?.start ?? range?.start
  const resolvedEnd = validationResult.range?.end ?? range?.end
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

  return (
    <div>
      <div data-testid="month-year-picker" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="month-year-year">Year</label>
          <select
            id="month-year-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === '' ? '' : Number(e.target.value))}
            data-testid="month-year-year"
          >
            <option value="">Select year</option>
            {getYearOptions().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month-year-month">Month</label>
          <select
            id="month-year-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value === '' ? '' : Number(e.target.value))}
            data-testid="month-year-month"
          >
            <option value="">Select month</option>
            {MONTH_LABELS.map((label, i) => (
              <option key={i} value={i + 1}>
                {label}
              </option>
            ))}
          </select>
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
            if (!downloadEnabled || !resolvedStart || !resolvedEnd) return
            setGeneratingPdf(true)
            await delay(UX_DELAYS.SPINNER_BEFORE_PDF_MS)
            try {
              const bytes = await generateDateRangeReport(resolvedStart, resolvedEnd)
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
