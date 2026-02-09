import { useMemo, useState, useEffect, useRef } from 'react'
import { endOfMonth } from 'date-fns'
import { LoadingSpinner } from '../../components/LoadingSpinner'
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

/** If last range start is April 1, return that fiscal year (start year); else ''. */
function initialFyFromLeakage(): number | '' {
  const r = getLastDateRange()
  if (!r?.from) return ''
  const d = parseDate(r.from)
  if (!d || Number.isNaN(d.getTime())) return ''
  if (d.getMonth() !== 3 || d.getDate() !== 1) return ''
  const y = d.getFullYear()
  const opts = getFiscalYearOptions()
  return opts.includes(y) ? y : ''
}

/**
 * Year-only fiscal year picker. Single control; FY runs April–March.
 * No date-range length validation: selecting a year/fiscal year is always valid. PDF covers full fiscal year.
 */
export function YearOnlyScenario() {
  const [selectedFy, setSelectedFy] = useState<number | ''>(() => initialFyFromLeakage())
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([selectedFy])
  const fySelectRef = useRef<HTMLSelectElement>(null)

  const range = useMemo(() => {
    if (selectedFy === '') return null
    return fiscalYearRange(selectedFy)
  }, [selectedFy])

  const startInput = range ? formatDate(range.start) : ''
  const endInput = range ? formatDate(range.end) : ''

  const validationResult = useMemo(
    () => validateRange(startInput, endInput, { skipMaxRange: true }),
    [startInput, endInput]
  )
  const resolvedStart = validationResult.range?.start ?? range?.start
  const resolvedEnd = validationResult.range?.end ?? range?.end
  const valid = validationResult.valid
  useFocusResetOnError(valid, fySelectRef)

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

  const hasValidationErrors = !valid && validationResult.errors.length > 0
  const showValidationErrors = useValidationErrorDisplay(hasValidationErrors)
  const { requireReauthBeforeSensitiveAction } = useAuth()

  useEffect(() => {
    if (!appConfig.enableStateLeakage || selectedFy === '') return
    const { start, end } = fiscalYearRange(selectedFy)
    setLastDateRange({ from: formatDate(start), to: formatDate(end) })
  }, [selectedFy])

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
          Choose fiscal year{!appConfig.enableAntiPatterns ? ' (required)' : ''}
        </label>
        <select
          ref={fySelectRef}
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
            if (!downloadEnabled || !resolvedStart || !resolvedEnd) return
            const ok = await requireReauthBeforeSensitiveAction()
            if (!ok) return
            setGeneratingPdf(true)
            await chaosDelay(UX_DELAYS.SPINNER_BEFORE_PDF_MS)
            try {
              const bytes = await generateDateRangeReport(resolvedStart, resolvedEnd)
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
