import { useMemo, useState, useEffect, useRef } from 'react'
import { SimpleCalendar } from '../../components/SimpleCalendar'
import { PickerContainer } from '../../components/PickerContainer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { appConfig } from '../../config/appConfig'
import { stressConfig } from '../../config/stressConfig'
import { formatDate, parseDate } from '../../config/dateLocale'
import { UX_DELAYS } from '../../config/uxDelays'
import { getBankThemeConfig } from '../../config/bankThemes'
import { DomNoiseDecorativeIcon } from '../../components/DomNoise'
import { validateRange } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { chaosDelay, chaosPick } from '../../utils/chaos'
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

function initialDateFromLeakage(field: 'from' | 'to'): Date | null {
  const r = getLastDateRange()
  const str = field === 'from' ? r?.from : r?.to
  if (!str) return null
  const d = parseDate(str)
  return d && !Number.isNaN(d.getTime()) ? d : null
}

function initialMonthFromLeakage(): Date {
  const m = getLastCalendarMonth()
  return m ? new Date(m + '-01') : new Date()
}

/**
 * Dual calendar range picker. Left calendar = start date, right = end date.
 * No auto-correction: inverted ranges (start > end) are allowed for validation/automation recovery.
 */
export function DualCalendarScenario() {
  const [startDate, setStartDate] = useState<Date | null>(() => initialDateFromLeakage('from'))
  const [endDate, setEndDate] = useState<Date | null>(() => initialDateFromLeakage('to'))
  const [leftMonth, setLeftMonth] = useState(() => initialMonthFromLeakage())
  const [rightMonth, setRightMonth] = useState(() => initialMonthFromLeakage())
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([startDate, endDate])
  const focusResetRef = useRef<HTMLDivElement>(null)

  const startInput = startDate ? formatDate(startDate) : ''
  const endInput = endDate ? formatDate(endDate) : ''

  const validationResult = useMemo(
    () => validateRange(startInput, endInput),
    [startInput, endInput]
  )
  const resolvedStart = validationResult.range?.start ?? startDate
  const resolvedEnd = validationResult.range?.end ?? endDate
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

  useEffect(() => {
    if (!appConfig.enableStateLeakage) return
    if (startDate && endDate) {
      setLastDateRange({ from: formatDate(startDate), to: formatDate(endDate) })
    }
  }, [startDate, endDate])

  useEffect(() => {
    if (!appConfig.enableStateLeakage) return
    const y = leftMonth.getFullYear()
    const mm = String(leftMonth.getMonth() + 1).padStart(2, '0')
    setLastCalendarMonth(`${y}-${mm}`)
  }, [leftMonth])

  async function handleStartSelect(date: Date) {
    setStartDate(date)
    await chaosDelay(stressConfig.uiDelayMs)
  }

  async function handleEndSelect(date: Date) {
    setEndDate(date)
    await chaosDelay(stressConfig.uiDelayMs)
  }

  const showDisabledDatesStress =
    stressConfig.disabledDatesChangeAfterSelection && (startDate != null || endDate != null)
  const isDayDisabled = showDisabledDatesStress ? isDateDisabledAfterSelection : undefined
  const downloadEnabled =
    valid &&
    !isCooldown &&
    !generatingPdf &&
    (!stressConfig.loadingSpinnerBeforeDownload || downloadReady)

  const { requireReauthBeforeSensitiveAction } = useAuth()
  const hasValidationErrors = !valid && validationResult.errors.length > 0
  const showValidationErrors = useValidationErrorDisplay(hasValidationErrors)

  const swapCalendars = useMemo(
    () => appConfig.chaosLevel >= 1 && chaosPick([false, true]),
    []
  )

  const startCalendarNode = (
    <div key="start" data-testid="calendar-start-container">
      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
        Start date{!appConfig.enableAntiPatterns ? ' (required)' : ''}
      </p>
      <PickerContainer>
        <SimpleCalendar
          month={leftMonth}
          onMonthChange={setLeftMonth}
          start={startDate}
          end={endDate}
          onSelectDay={(d) => void handleStartSelect(d)}
          isDayDisabled={isDayDisabled}
          calendarTestId="calendar-start"
        />
      </PickerContainer>
    </div>
  )
  const endCalendarNode = (
    <div key="end" data-testid="calendar-end-container">
      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
        End date{!appConfig.enableAntiPatterns ? ' (required)' : ''}
      </p>
      <PickerContainer>
        <SimpleCalendar
          month={rightMonth}
          onMonthChange={setRightMonth}
          start={startDate}
          end={endDate}
          onSelectDay={(d) => void handleEndSelect(d)}
          isDayDisabled={isDayDisabled}
          calendarTestId="calendar-end"
        />
      </PickerContainer>
    </div>
  )
  const calendarNodes = swapCalendars ? [endCalendarNode, startCalendarNode] : [startCalendarNode, endCalendarNode]

  return (
    <div>
      <div ref={focusResetRef} tabIndex={-1} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }} aria-hidden />
      <div
        data-testid="dual-calendar-container"
        style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}
      >
        {calendarNodes}
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
