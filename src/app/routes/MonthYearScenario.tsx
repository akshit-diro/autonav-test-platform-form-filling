import { useMemo, useState, useEffect, useRef } from 'react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { appConfig } from '../../config/appConfig'
import { stressConfig } from '../../config/stressConfig'
import { UX_DELAYS } from '../../config/uxDelays'
import { getBankThemeConfig } from '../../config/bankThemes'
import { DomNoiseDecorativeIcon } from '../../components/DomNoise'
import { validateRange } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { chaosDelay, chaosPick } from '../../utils/chaos'
import { formatDate, parseDate } from '../../config/dateLocale'
import { useAuth } from '../../auth/useAuth'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'
import { useFocusResetOnError } from '../../utils/useFocusResetOnError'
import { useValidationErrorDisplay } from '../../utils/useValidationErrorDisplay'
import { getLastDateRange, setLastDateRange } from '../../utils/stateLeakage'

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getYearOptions(): number[] {
  const current = new Date().getFullYear()
  const from = current - 5
  return Array.from({ length: 6 }, (_, i) => from + i)
}

function initialMonthYearFromLeakage(): { year: number | ''; month: number | '' } {
  const r = getLastDateRange()
  if (!r?.from) return { year: '', month: '' }
  const d = parseDate(r.from)
  if (!d || Number.isNaN(d.getTime())) return { year: '', month: '' }
  const opts = getYearOptions()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  if (!opts.includes(y)) return { year: '', month: '' }
  return { year: y, month: m }
}

/**
 * Month & year picker. No day-level UI; selecting month resolves to full month range.
 * Validation applies (e.g. months with 31 days exceed max range).
 */
export function MonthYearScenario() {
  const [selectedYear, setSelectedYear] = useState<number | ''>(() => initialMonthYearFromLeakage().year)
  const [selectedMonth, setSelectedMonth] = useState<number | ''>(() => initialMonthYearFromLeakage().month)
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([selectedYear, selectedMonth])
  const yearSelectRef = useRef<HTMLSelectElement>(null)

  const range = useMemo(() => {
    if (selectedYear === '' || selectedMonth === '') return null
    const d = new Date(selectedYear, selectedMonth - 1, 1)
    return {
      start: startOfMonth(d),
      end: endOfMonth(d),
    }
  }, [selectedYear, selectedMonth])

  const startInput = range ? formatDate(range.start) : ''
  const endInput = range ? formatDate(range.end) : ''

  const validationResult = useMemo(
    () => validateRange(startInput, endInput),
    [startInput, endInput]
  )
  const resolvedStart = validationResult.range?.start ?? range?.start
  const resolvedEnd = validationResult.range?.end ?? range?.end
  const valid = validationResult.valid
  useFocusResetOnError(valid, yearSelectRef)

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
    if (!appConfig.enableStateLeakage || selectedYear === '' || selectedMonth === '') return
    const d = new Date(selectedYear, selectedMonth - 1, 1)
    setLastDateRange({
      from: formatDate(startOfMonth(d)),
      to: formatDate(endOfMonth(d)),
    })
  }, [selectedYear, selectedMonth])

  const swapYearMonthOrder = useMemo(
    () => appConfig.chaosLevel >= 1 && chaosPick([false, true]),
    []
  )

  const yearField = (
    <div key="year">
      <label htmlFor="month-year-year">
        Year{!appConfig.enableAntiPatterns ? ' (required)' : ''}
      </label>
      <select
        ref={yearSelectRef}
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
  )
  const monthField = (
    <div key="month">
      <label htmlFor="month-year-month">
        Month{!appConfig.enableAntiPatterns ? ' (required)' : ''}
      </label>
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
  )
  const pickerFields = swapYearMonthOrder ? [monthField, yearField] : [yearField, monthField]

  return (
    <div>
      <div data-testid="month-year-picker" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        {pickerFields}
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
