import { useMemo, useState, useEffect } from 'react'
import { endOfMonth } from 'date-fns'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { stressConfig } from '../../config/stressConfig'
import { UX_DELAYS } from '../../config/uxDelays'
import { validateRange } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { delay } from '../../utils/delay'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'

/** Fiscal year: April (year) to March (year+1). Returns start and end dates. */
function fiscalYearRange(startYear: number): { start: Date; end: Date } {
  const start = new Date(startYear, 3, 1) // April 1 (month 3)
  const end = endOfMonth(new Date(startYear + 1, 2, 1)) // March 31 next year
  return { start, end }
}

/** Label for display e.g. "FY 2024–25". */
function fiscalYearLabel(startYear: number): string {
  const endYear = String(startYear + 1).slice(-2)
  return `FY ${startYear}–${endYear}`
}

function getFiscalYearOptions(): number[] {
  const current = new Date().getFullYear()
  const from = current - 5
  return Array.from({ length: 6 }, (_, i) => from + i)
}

/**
 * Year-only fiscal year picker. Single control; FY runs April–March.
 * No Jan–Dec assumption. Max-range validation applies (full FY exceeds 30 days).
 */
export function YearOnlyScenario() {
  const [selectedFy, setSelectedFy] = useState<number | ''>('')
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([selectedFy])

  const range = useMemo(() => {
    if (selectedFy === '') return null
    return fiscalYearRange(selectedFy)
  }, [selectedFy])

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
      <fieldset
        data-testid="fiscal-year-picker"
        style={{
          border: '1px solid #666',
          borderRadius: 6,
          padding: '1rem 1.25rem',
          maxWidth: '20rem',
          marginBottom: '1rem',
        }}
      >
        <legend style={{ padding: '0 0.25rem', fontWeight: 600 }}>
          Fiscal year (April–March)
        </legend>
        <label htmlFor="fiscal-year-select" style={{ display: 'block', marginBottom: 0 }}>
          Choose fiscal year
        </label>
        <select
          id="fiscal-year-select"
          value={selectedFy}
          onChange={(e) =>
            setSelectedFy(e.target.value === '' ? '' : Number(e.target.value))
          }
          data-testid="fiscal-year-select"
          style={{ marginTop: '0.35rem', minWidth: '10rem' }}
        >
          <option value="">—</option>
          {getFiscalYearOptions().map((y) => (
            <option key={y} value={y}>
              {fiscalYearLabel(y)}
            </option>
          ))}
        </select>
      </fieldset>

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
