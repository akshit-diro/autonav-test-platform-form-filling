import { useMemo, useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getScenario } from '../../config/scenarioMatrix'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { appConfig } from '../../config/appConfig'
import { stressConfig } from '../../config/stressConfig'
import { getLastDateRange, setLastDateRange } from '../../utils/stateLeakage'
import { UX_DELAYS } from '../../config/uxDelays'
import { getBankThemeConfig } from '../../config/bankThemes'
import { getDateFormatPattern, isIsoDateFormat } from '../../config/dateLocale'
import { DomNoise, DomNoiseDecorativeIcon } from '../../components/DomNoise'
import { validateRange } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { chaosDelay, chaosPick, chaosShuffled } from '../../utils/chaos'
import { useAuth } from '../../auth/useAuth'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'
import { useFocusResetOnError } from '../../utils/useFocusResetOnError'
import { PresetsScenario } from './PresetsScenario'
import { FromToScenario } from './FromToScenario'
import { DualCalendarScenario } from './DualCalendarScenario'
import { MonthYearScenario } from './MonthYearScenario'
import { YearOnlyScenario } from './YearOnlyScenario'
import { InlineCalendarScenario } from './InlineCalendarScenario'

/** Placeholder preset ids for data-testid and future behavior. */
const PRESETS = [
  { id: 'last-7', label: 'Last 7 days' },
  { id: 'last-30', label: 'Last 30 days' },
  { id: 'this-month', label: 'This month' },
] as const

function getInitialStartEnd(): { start: string; end: string } {
  const r = getLastDateRange()
  return { start: r?.from ?? '', end: r?.to ?? '' }
}

function GenericScenarioContent() {
  const [startInput, setStartInput] = useState(() => getInitialStartEnd().start)
  const [endInput, setEndInput] = useState(() => getInitialStartEnd().end)
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([startInput, endInput])
  const startInputRef = useRef<HTMLInputElement>(null)
  const { requireReauthBeforeSensitiveAction } = useAuth()

  useEffect(() => {
    if (!appConfig.enableStateLeakage || !startInput.trim() || !endInput.trim()) return
    setLastDateRange({ from: startInput.trim(), to: endInput.trim() })
  }, [startInput, endInput])

  const validationResult = useMemo(
    () => validateRange(startInput, endInput),
    [startInput, endInput]
  )
  const resolvedStart = validationResult.range?.start
  const resolvedEnd = validationResult.range?.end
  const valid = validationResult.valid
  useFocusResetOnError(valid, startInputRef)

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

  const swapStartEndOrder = useMemo(
    () => appConfig.chaosLevel >= 1 && chaosPick([false, true]),
    []
  )

  const startField = (
    <div key="start">
      <label htmlFor="date-start">
        Start date{!appConfig.enableAntiPatterns ? ' (required)' : ''}
      </label>
      <input
        ref={startInputRef}
        id="date-start"
        type={isIsoDateFormat() ? 'date' : 'text'}
        value={startInput}
        onChange={(e) => setStartInput(e.target.value)}
        placeholder={isIsoDateFormat() ? undefined : getDateFormatPattern()}
        data-testid="date-start"
      />
    </div>
  )
  const endField = (
    <div key="end">
      <label htmlFor="date-end">
        End date{!appConfig.enableAntiPatterns ? ' (required)' : ''}
      </label>
      <input
        id="date-end"
        type={isIsoDateFormat() ? 'date' : 'text'}
        value={endInput}
        onChange={(e) => setEndInput(e.target.value)}
        placeholder={isIsoDateFormat() ? undefined : getDateFormatPattern()}
        data-testid="date-end"
      />
    </div>
  )
  const dateInputFields = swapStartEndOrder ? [endField, startField] : [startField, endField]

  const displayPresets = useMemo(
    () => (appConfig.chaosLevel >= 1 ? chaosShuffled(PRESETS) : PRESETS),
    []
  )

  return (
    <>
      <div aria-label="Date range inputs" data-testid="date-range-inputs">
        {dateInputFields}
      </div>

      <div data-testid="preset-buttons" style={{ marginTop: '0.5rem' }}>
        {displayPresets.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            data-testid={`preset-${id}`}
            disabled
            title="Preset not wired yet"
          >
            {label}
          </button>
        ))}
      </div>

      <div data-testid="calendar-placeholder" style={{ marginTop: '1rem' }} aria-label="Calendar placeholder">
        <div role="grid" aria-label="Calendar" data-testid="calendar">
          {Array.from({ length: 6 }, (_, row) => (
            <div key={row} role="row" style={{ display: 'flex' }}>
              {Array.from({ length: 7 }, (_, col) => (
                <div
                  key={col}
                  role="gridcell"
                  data-testid="calendar-cell"
                  data-calendar-row={row}
                  data-calendar-col={col}
                  style={{ width: '2rem', height: '2rem', border: '1px solid #eee', margin: 1 }}
                  aria-label={`Cell ${row}-${col}`}
                >
                  {' '}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

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
    </>
  )
}

export function ScenarioPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined

  if (!scenario) {
    return (
      <div>
        <p>Scenario not found.</p>
        <Link to="/">Go to home</Link>
      </div>
    )
  }

  const isPresets = scenarioId === 'presets'
  const isFromTo = scenarioId === 'from-to'
  const isDualCalendar = scenarioId === 'dual-calendar'
  const isMonthYear = scenarioId === 'month-year'
  const isYearOnly = scenarioId === 'year-only'
  const isInlineCalendar = scenarioId === 'inline-calendar'

  return (
    <div className="page page--statement">
      <DomNoise placement="statement" />
      <h1>{scenario.displayName}</h1>
      <p className="page__description">{scenario.description}</p>

      {isPresets && <PresetsScenario />}
      {isFromTo && <FromToScenario />}
      {isDualCalendar && <DualCalendarScenario />}
      {isMonthYear && <MonthYearScenario />}
      {isYearOnly && <YearOnlyScenario />}
      {isInlineCalendar && <InlineCalendarScenario />}
      {!isPresets && !isFromTo && !isDualCalendar && !isMonthYear && !isYearOnly && !isInlineCalendar && (
        <GenericScenarioContent />
      )}

      <p>
        <Link to="/">Back to home</Link>
      </p>
    </div>
  )
}
