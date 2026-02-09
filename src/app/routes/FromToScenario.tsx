import { useMemo, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { CalendarPopover } from '../../components/CalendarPopover'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { stressConfig } from '../../config/stressConfig'
import { UX_DELAYS } from '../../config/uxDelays'
import {
  validateRange,
  DATE_RANGE_ERROR_CODES,
  type DateRangeValidationError,
} from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { delay } from '../../utils/delay'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'
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

function errorsForField(
  errors: DateRangeValidationError[],
  codes: readonly string[]
): DateRangeValidationError[] {
  return errors.filter((e) => codes.includes(e.code))
}

export function FromToScenario() {
  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')
  const [fromPopoverOpen, setFromPopoverOpen] = useState(false)
  const [toPopoverOpen, setToPopoverOpen] = useState(false)
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([fromInput, toInput])

  const validationResult = useMemo(
    () => validateRange(fromInput, toInput),
    [fromInput, toInput]
  )
  const resolvedStart = validationResult.range?.start
  const resolvedEnd = validationResult.range?.end
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

  const fromErrors = errorsForField(validationResult.errors, FROM_ERROR_CODES)
  const toErrors = errorsForField(validationResult.errors, TO_ERROR_CODES)

  const fromDate = resolvedStart ?? (fromInput ? new Date(fromInput) : null)
  const toDate = resolvedEnd ?? (toInput ? new Date(toInput) : null)
  const fromDateValid = fromDate && !Number.isNaN(fromDate.getTime())
  const toDateValid = toDate && !Number.isNaN(toDate.getTime())

  async function handleFromSelect(date: Date) {
    setFromInput(format(date, 'yyyy-MM-dd'))
    setFromPopoverOpen(false)
    await delay(stressConfig.uiDelayMs)
  }

  async function handleToSelect(date: Date) {
    setToInput(format(date, 'yyyy-MM-dd'))
    setToPopoverOpen(false)
    await delay(stressConfig.uiDelayMs)
  }

  const showDisabledDatesStress =
    stressConfig.disabledDatesChangeAfterSelection && (fromInput !== '' || toInput !== '')
  const isDayDisabled = showDisabledDatesStress ? isDateDisabledAfterSelection : undefined
  const downloadEnabled =
    valid &&
    !isCooldown &&
    !generatingPdf &&
    (!stressConfig.loadingSpinnerBeforeDownload || downloadReady)

  return (
    <div>
      <div aria-label="Date range inputs" data-testid="date-range-inputs">
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <label htmlFor="date-from">From</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input
              id="date-from"
              type="date"
              value={fromInput}
              onChange={(e) => setFromInput(e.target.value)}
              data-testid="date-from"
              aria-invalid={fromErrors.length > 0}
              aria-describedby={fromErrors.length > 0 ? 'from-errors' : undefined}
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
          {fromErrors.length > 0 && (
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

        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <label htmlFor="date-to">To</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input
              id="date-to"
              type="date"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              data-testid="date-to"
              aria-invalid={toErrors.length > 0}
              aria-describedby={toErrors.length > 0 ? 'to-errors' : undefined}
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
          {toErrors.length > 0 && (
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
      </div>

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
