import { useMemo, useState, useEffect, useRef } from 'react'
import { formatDate, getDateFormatPattern, isIsoDateFormat, parseDate } from '../../config/dateLocale'
import { CalendarPopover } from '../../components/CalendarPopover'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { appConfig } from '../../config/appConfig'
import { stressConfig } from '../../config/stressConfig'
import { UX_DELAYS } from '../../config/uxDelays'
import { getBankThemeConfig } from '../../config/bankThemes'
import { DomNoiseDecorativeIcon } from '../../components/DomNoise'
import {
  validateRange,
  DATE_RANGE_ERROR_CODES,
  type DateRangeValidationError,
} from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { chaosDelay, chaosPick } from '../../utils/chaos'
import { useAuth } from '../../auth/useAuth'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'
import { useFocusResetOnError } from '../../utils/useFocusResetOnError'
import { getLastDateRange, setLastDateRange } from '../../utils/stateLeakage'
import { isDateDisabledAfterSelection } from '../../utils/stressDisabledDates'

const FROM_ERROR_CODES = [
  DATE_RANGE_ERROR_CODES.INVALID_START,
  DATE_RANGE_ERROR_CODES.START_AFTER_END,
] as const
const TO_ERROR_CODES = [
  DATE_RANGE_ERROR_CODES.INVALID_END,
  DATE_RANGE_ERROR_CODES.END_IN_FUTURE,
  DATE_RANGE_ERROR_CODES.START_AFTER_END,
  DATE_RANGE_ERROR_CODES.RANGE_EXCEEDS_MAX,
] as const

const ERROR_DISMISS_MS = 3000

function errorsForField(
  errors: DateRangeValidationError[],
  codes: readonly string[]
): DateRangeValidationError[] {
  return errors.filter((e) => codes.includes(e.code))
}

function getInitialFromTo(): { from: string; to: string } {
  const r = getLastDateRange()
  return { from: r?.from ?? '', to: r?.to ?? '' }
}

export function FromToScenario() {
  const [fromInput, setFromInput] = useState(() => getInitialFromTo().from)
  const [toInput, setToInput] = useState(() => getInitialFromTo().to)
  const [fromPopoverOpen, setFromPopoverOpen] = useState(false)
  const [toPopoverOpen, setToPopoverOpen] = useState(false)
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [fromTouched, setFromTouched] = useState(false)
  const [toTouched, setToTouched] = useState(false)
  const [errorsHidden, setErrorsHidden] = useState(false)
  const errorDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isCooldown = useDownloadCooldown([fromInput, toInput])
  const fromInputRef = useRef<HTMLInputElement>(null)
  const enableAntiPatterns = appConfig.enableAntiPatterns
  const { requireReauthBeforeSensitiveAction } = useAuth()

  const swapFromToOrder = useMemo(
    () => appConfig.chaosLevel >= 2 && chaosPick([false, true]),
    []
  )

  useEffect(() => {
    if (!appConfig.enableStateLeakage || !fromInput.trim() || !toInput.trim()) return
    setLastDateRange({ from: fromInput.trim(), to: toInput.trim() })
  }, [fromInput, toInput])

  const validationResult = useMemo(
    () => validateRange(fromInput, toInput),
    [fromInput, toInput]
  )
  const resolvedStart = validationResult.range?.start
  const resolvedEnd = validationResult.range?.end
  const valid = validationResult.valid
  useFocusResetOnError(valid, fromInputRef)

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

  const fromErrors = errorsForField(validationResult.errors, FROM_ERROR_CODES)
  const toErrors = errorsForField(validationResult.errors, TO_ERROR_CODES)

  const showFromErrors =
    fromErrors.length > 0 &&
    (!enableAntiPatterns || fromTouched) &&
    (!enableAntiPatterns || !errorsHidden)
  const showToErrors =
    toErrors.length > 0 &&
    (!enableAntiPatterns || toTouched) &&
    (!enableAntiPatterns || !errorsHidden)

  useEffect(() => {
    if (!enableAntiPatterns || (!showFromErrors && !showToErrors)) return
    if (errorDismissRef.current) clearTimeout(errorDismissRef.current)
    errorDismissRef.current = setTimeout(() => setErrorsHidden(true), ERROR_DISMISS_MS)
    return () => {
      if (errorDismissRef.current) {
        clearTimeout(errorDismissRef.current)
        errorDismissRef.current = null
      }
    }
  }, [enableAntiPatterns, showFromErrors, showToErrors])

  useEffect(() => {
    if (!enableAntiPatterns) return
    setErrorsHidden(false)
  }, [fromInput, toInput, enableAntiPatterns])

  const fromDate = resolvedStart ?? (fromInput ? parseDate(fromInput) : null)
  const toDate = resolvedEnd ?? (toInput ? parseDate(toInput) : null)
  const fromDateValid = fromDate && !Number.isNaN(fromDate.getTime())
  const toDateValid = toDate && !Number.isNaN(toDate.getTime())

  async function handleFromSelect(date: Date) {
    setFromInput(formatDate(date))
    setFromPopoverOpen(false)
    await chaosDelay(stressConfig.uiDelayMs)
  }

  async function handleToSelect(date: Date) {
    setToInput(formatDate(date))
    setToPopoverOpen(false)
    await chaosDelay(stressConfig.uiDelayMs)
  }

  const showDisabledDatesStress =
    stressConfig.disabledDatesChangeAfterSelection && (fromInput !== '' || toInput !== '')
  const isDayDisabled = showDisabledDatesStress ? isDateDisabledAfterSelection : undefined
  const downloadEnabled =
    valid &&
    !isCooldown &&
    !generatingPdf &&
    (!stressConfig.loadingSpinnerBeforeDownload || downloadReady)

  const fromBlock = (
    <div key="from" style={{ position: 'relative', marginBottom: '1rem' }}>
      <label htmlFor="date-from">
        From{!enableAntiPatterns ? ' (required)' : ''}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <input
          ref={fromInputRef}
          id="date-from"
          type={isIsoDateFormat() ? 'date' : 'text'}
          value={fromInput}
          onChange={(e) => setFromInput(e.target.value)}
          onBlur={() => setFromTouched(true)}
          placeholder={isIsoDateFormat() ? undefined : getDateFormatPattern()}
          data-testid="date-from"
          aria-invalid={showFromErrors}
          aria-describedby={showFromErrors ? 'from-errors' : undefined}
        />
        <button
          type="button"
          onClick={() => setFromPopoverOpen((o) => !o)}
          aria-expanded={fromPopoverOpen}
          aria-haspopup="dialog"
          data-testid="date-from-open-calendar"
        >
          Pick date
        </button>
      </div>
      <CalendarPopover
        open={fromPopoverOpen}
        onClose={() => setFromPopoverOpen(false)}
        value={fromDateValid ? fromDate : null}
        onSelectDate={(d) => void handleFromSelect(d)}
        isDayDisabled={isDayDisabled}
        data-testid="calendar-popover-from"
      />
      {showFromErrors && (
        <div
          id="from-errors"
          role="alert"
          data-testid="validation-error-from"
          data-validation-errors={fromErrors.map((e) => e.code).join(' ')}
          className="form-error"
        >
          {fromErrors.map((e) => (
            <div key={e.code} data-testid={`validation-error-${e.code}`}>
              {e.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const toBlock = (
    <div key="to" style={{ position: 'relative', marginBottom: '1rem' }}>
      <label htmlFor="date-to">
        To{!enableAntiPatterns ? ' (required)' : ''}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <input
          id="date-to"
          type={isIsoDateFormat() ? 'date' : 'text'}
          value={toInput}
          onChange={(e) => setToInput(e.target.value)}
          onBlur={() => setToTouched(true)}
          placeholder={isIsoDateFormat() ? undefined : getDateFormatPattern()}
          data-testid="date-to"
          aria-invalid={showToErrors}
          aria-describedby={showToErrors ? 'to-errors' : undefined}
        />
        <button
          type="button"
          onClick={() => setToPopoverOpen((o) => !o)}
          aria-expanded={toPopoverOpen}
          aria-haspopup="dialog"
          data-testid="date-to-open-calendar"
        >
          Pick date
        </button>
      </div>
      <CalendarPopover
        open={toPopoverOpen}
        onClose={() => setToPopoverOpen(false)}
        value={toDateValid ? toDate : null}
        onSelectDate={(d) => void handleToSelect(d)}
        isDayDisabled={isDayDisabled}
        data-testid="calendar-popover-to"
      />
      {showToErrors && (
        <div
          id="to-errors"
          role="alert"
          data-testid="validation-error-to"
          data-validation-errors={toErrors.map((e) => e.code).join(' ')}
          className="form-error"
        >
          {toErrors.map((e) => (
            <div key={e.code} data-testid={`validation-error-${e.code}`}>
              {e.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const rangeInputBlocks = swapFromToOrder ? [toBlock, fromBlock] : [fromBlock, toBlock]

  return (
    <div>
      <div aria-label="Date range inputs" data-testid="date-range-inputs">
        {rangeInputBlocks}
      </div>

      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <button
          type="button"
          disabled={!downloadEnabled}
          title={
            !enableAntiPatterns && !downloadEnabled
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
