import { useMemo, useState, useEffect, useRef } from 'react'
import { formatDate } from '../../config/dateLocale'
import { SimpleCalendar } from '../../components/SimpleCalendar'
import { PickerContainer } from '../../components/PickerContainer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { appConfig } from '../../config/appConfig'
import { stressConfig } from '../../config/stressConfig'
import { UX_DELAYS } from '../../config/uxDelays'
import { getBankThemeConfig } from '../../config/bankThemes'
import { DomNoiseDecorativeIcon } from '../../components/DomNoise'
import { validateRange } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { chaosDelay } from '../../utils/chaos'
import { useAuth } from '../../auth/useAuth'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'
import { useFocusResetOnError } from '../../utils/useFocusResetOnError'
import { useValidationErrorDisplay } from '../../utils/useValidationErrorDisplay'
import {
  getLastDateRange,
  setLastDateRange,
  getLastCalendarMonth,
  setLastCalendarMonth,
} from '../../utils/stateLeakage'
import { isDateDisabledAfterSelection } from '../../utils/stressDisabledDates'

function getInitialRange(): { from: string; to: string } {
  const r = getLastDateRange()
  return { from: r?.from ?? '', to: r?.to ?? '' }
}

function getInitialCalendarMonth(): Date {
  const m = getLastCalendarMonth()
  return m ? new Date(m + '-01') : new Date()
}

/**
 * Inline (docked) calendar. Always visible, no modal or popover.
 * Range selection directly in the calendar; persistent DOM.
 */
export function InlineCalendarScenario() {
  const [startInput, setStartInput] = useState(() => getInitialRange().from)
  const [endInput, setEndInput] = useState(() => getInitialRange().to)
  const [calendarMonth, setCalendarMonth] = useState(() => getInitialCalendarMonth())
  const [pendingEnd, setPendingEnd] = useState<Date | null>(null)
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([startInput, endInput])
  const focusResetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!appConfig.enableStateLeakage || !startInput.trim() || !endInput.trim()) return
    setLastDateRange({ from: startInput.trim(), to: endInput.trim() })
  }, [startInput, endInput])

  useEffect(() => {
    if (!appConfig.enableStateLeakage) return
    const y = calendarMonth.getFullYear()
    const mm = String(calendarMonth.getMonth() + 1).padStart(2, '0')
    setLastCalendarMonth(`${y}-${mm}`)
  }, [calendarMonth])

  const validationResult = useMemo(
    () => validateRange(startInput, endInput),
    [startInput, endInput]
  )
  const resolvedStart = validationResult.range?.start
  const resolvedEnd = validationResult.range?.end
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

  function applyRange(start: Date, end: Date) {
    setStartInput(formatDate(start))
    setEndInput(formatDate(end))
  }

  async function handleCalendarDay(date: Date) {
    if (pendingEnd === null) {
      setPendingEnd(date)
      applyRange(date, date)
      await chaosDelay(stressConfig.uiDelayMs)
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
    await chaosDelay(stressConfig.uiDelayMs)
  }

  const showDisabledDatesStress =
    stressConfig.disabledDatesChangeAfterSelection && (resolvedStart != null || pendingEnd != null)
  const isDayDisabled = showDisabledDatesStress ? isDateDisabledAfterSelection : undefined
  const downloadEnabled =
    valid &&
    !isCooldown &&
    !generatingPdf &&
    (!stressConfig.loadingSpinnerBeforeDownload || downloadReady)

  const hasValidationErrors = !valid && validationResult.errors.length > 0
  const showValidationErrors = useValidationErrorDisplay(hasValidationErrors)
  const { requireReauthBeforeSensitiveAction } = useAuth()

  return (
    <div>
      <div ref={focusResetRef} tabIndex={-1} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }} aria-hidden />
      <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        Click a day to set start, then another to set end. Range is highlighted.
      </p>
      <div
        data-testid="inline-calendar"
        style={{ marginBottom: '1rem' }}
      >
        <PickerContainer>
          <SimpleCalendar
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            start={resolvedStart ?? null}
            end={resolvedEnd ?? null}
            onSelectDay={(d) => void handleCalendarDay(d)}
            isDayDisabled={isDayDisabled}
            calendarTestId="inline-calendar-grid"
          />
        </PickerContainer>
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
