import { useMemo, useState, useEffect } from 'react'
import { format } from 'date-fns'
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
 * Inline (docked) calendar. Always visible, no modal or popover.
 * Range selection directly in the calendar; persistent DOM.
 */
export function InlineCalendarScenario() {
  const [startInput, setStartInput] = useState('')
  const [endInput, setEndInput] = useState('')
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [pendingEnd, setPendingEnd] = useState<Date | null>(null)
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([startInput, endInput])

  const validationResult = useMemo(
    () => validateRange(startInput, endInput),
    [startInput, endInput]
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

  function applyRange(start: Date, end: Date) {
    setStartInput(format(start, 'yyyy-MM-dd'))
    setEndInput(format(end, 'yyyy-MM-dd'))
  }

  async function handleCalendarDay(date: Date) {
    if (pendingEnd === null) {
      setPendingEnd(date)
      applyRange(date, date)
      await delay(stressConfig.uiDelayMs)
      return
    }
    const start = new Date(pendingEnd)
    const end = date
    if (start.getTime() > end.getTime()) {
      applyRange(start, end)
    } else {
      applyRange(start, end)
    }
    setPendingEnd(null)
    await delay(stressConfig.uiDelayMs)
  }

  const showDisabledDatesStress =
    stressConfig.disabledDatesChangeAfterSelection && (resolvedStart != null || pendingEnd != null)
  const isDayDisabled = showDisabledDatesStress ? isDateDisabledAfterSelection : undefined
  const downloadEnabled =
    valid &&
    !isCooldown &&
    !generatingPdf &&
    (!stressConfig.loadingSpinnerBeforeDownload || downloadReady)

  return (
    <div>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        Click a day to set start, then another to set end. Range is highlighted.
      </p>
      <div
        data-testid="inline-calendar"
        style={{ marginBottom: '1rem' }}
      >
        <SimpleCalendar
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          start={resolvedStart ?? null}
          end={resolvedEnd ?? null}
          onSelectDay={(d) => void handleCalendarDay(d)}
          isDayDisabled={isDayDisabled}
          calendarTestId="inline-calendar-grid"
        />
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
