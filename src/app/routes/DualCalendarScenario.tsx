import { useMemo, useState, useEffect } from 'react'
import { SimpleCalendar } from '../../components/SimpleCalendar'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { stressConfig } from '../../config/stressConfig'
import { UX_DELAYS } from '../../config/uxDelays'
import { validateRange } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { delay } from '../../utils/delay'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'
import { isDateDisabledAfterSelection } from '../../utils/stressDisabledDates'

/**
 * Dual calendar range picker. Left calendar = start date, right = end date.
 * No auto-correction: inverted ranges (start > end) are allowed for validation/automation recovery.
 */
export function DualCalendarScenario() {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [leftMonth, setLeftMonth] = useState(() => new Date())
  const [rightMonth, setRightMonth] = useState(() => new Date())
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([startDate, endDate])

  const startInput = startDate ? startDate.toISOString().slice(0, 10) : ''
  const endInput = endDate ? endDate.toISOString().slice(0, 10) : ''

  const validationResult = useMemo(
    () => validateRange(startInput, endInput),
    [startInput, endInput]
  )
  const resolvedStart = validationResult.range?.start ?? startDate
  const resolvedEnd = validationResult.range?.end ?? endDate
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

  async function handleStartSelect(date: Date) {
    setStartDate(date)
    await delay(stressConfig.uiDelayMs)
  }

  async function handleEndSelect(date: Date) {
    setEndDate(date)
    await delay(stressConfig.uiDelayMs)
  }

  const showDisabledDatesStress =
    stressConfig.disabledDatesChangeAfterSelection && (startDate != null || endDate != null)
  const isDayDisabled = showDisabledDatesStress ? isDateDisabledAfterSelection : undefined
  const downloadEnabled =
    valid &&
    !isCooldown &&
    !generatingPdf &&
    (!stressConfig.loadingSpinnerBeforeDownload || downloadReady)

  return (
    <div>
      <div
        data-testid="dual-calendar-container"
        style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}
      >
        <div data-testid="calendar-start-container">
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
            Start date
          </p>
          <SimpleCalendar
            month={leftMonth}
            onMonthChange={setLeftMonth}
            start={startDate}
            end={endDate}
            onSelectDay={(d) => void handleStartSelect(d)}
            isDayDisabled={isDayDisabled}
            calendarTestId="calendar-start"
          />
        </div>
        <div data-testid="calendar-end-container">
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
            End date
          </p>
          <SimpleCalendar
            month={rightMonth}
            onMonthChange={setRightMonth}
            start={startDate}
            end={endDate}
            onSelectDay={(d) => void handleEndSelect(d)}
            isDayDisabled={isDayDisabled}
            calendarTestId="calendar-end"
          />
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
