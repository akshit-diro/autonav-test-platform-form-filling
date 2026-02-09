import { useMemo, useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getScenario, getScenarioIdFromRoute } from '../../config/scenarioMatrix'
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
import { runPickerScenario } from '../../scenario-engine'
import type { ExecutionResult } from '../../scenario-engine'
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
  const { scenarioId: paramScenarioId, picker, baseScenario } = useParams<{
    scenarioId?: string
    picker?: string
    baseScenario?: string
  }>()
  const effectiveScenarioId =
    picker != null && baseScenario != null
      ? getScenarioIdFromRoute(picker, baseScenario)
      : paramScenarioId ?? undefined
  const scenario = effectiveScenarioId ? getScenario(effectiveScenarioId) : undefined

  if (!scenario) {
    return (
      <div>
        <p>Scenario not found.</p>
        <Link to="/">Go to home</Link>
      </div>
    )
  }

  const isPresets = effectiveScenarioId === 'presets'
  const isFromTo = effectiveScenarioId === 'from-to'
  const isDualCalendar = effectiveScenarioId === 'dual-calendar'
  const isMonthYear = effectiveScenarioId === 'month-year'
  const isYearOnly = effectiveScenarioId === 'year-only'
  const isInlineCalendar = effectiveScenarioId === 'inline-calendar'
  const isPickerVariant = Boolean(scenario.metadata?.pickerType)

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

      {isPickerVariant && effectiveScenarioId && (
        <PickerFlowPanel scenarioId={effectiveScenarioId} />
      )}

      <p>
        <Link to="/">Back to home</Link>
      </p>
    </div>
  )
}

/** Panel to run picker flow and show structured logs (scenario → picker → strategy → outcome). */
function PickerFlowPanel({ scenarioId }: { scenarioId: string }) {
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [running, setRunning] = useState(false)

  function handleRun() {
    setRunning(true)
    setResult(null)
    try {
      const executionResult = runPickerScenario(scenarioId, { scope: document })
      setResult(executionResult)
    } finally {
      setRunning(false)
    }
  }

  return (
    <section
      className="picker-flow-panel"
      aria-labelledby="picker-flow-heading"
      data-testid="picker-flow-panel"
      style={{
        marginTop: '1.5rem',
        padding: '1rem',
        border: '1px solid var(--bank-border)',
        borderRadius: 'var(--bank-radius)',
        backgroundColor: 'var(--bank-bg-elevated)',
      }}
    >
      <h2 id="picker-flow-heading" style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>
        Picker flow
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--bank-text-muted)', margin: '0 0 0.75rem 0' }}>
        Run detect → open → setDate → confirm → validate for this scenario.
      </p>
      <button
        type="button"
        onClick={handleRun}
        disabled={running}
        data-testid="picker-flow-run"
      >
        {running ? 'Running…' : 'Run picker flow'}
      </button>

      {result && (
        <div data-testid="picker-flow-result" style={{ marginTop: '1rem' }}>
          <div
            data-testid="picker-flow-outcome"
            data-success={result.success}
            data-failure-reason={result.failureReason ?? undefined}
            style={{
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: result.success ? 'var(--bank-text)' : 'var(--bank-error, #c00)',
            }}
            role="status"
          >
            {result.success ? 'Success' : `Failed: ${result.failureReason ?? 'unknown'}`}
          </div>
          {result.validation && (
            <div data-testid="picker-flow-validation" style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
              Input updated: {result.validation.inputValueUpdated ? 'yes' : 'no'} · Model: {result.validation.modelUpdated ? 'yes' : 'no'} · Payload: {result.validation.payloadCorrect ? 'yes' : 'no'}
              {result.validation.message && ` · ${result.validation.message}`}
            </div>
          )}
          <ul
            data-testid="picker-flow-logs"
            aria-label="Step logs"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: '0.8125rem',
              fontFamily: 'monospace',
            }}
          >
            {result.logs.map((log, i) => (
              <li
                key={i}
                data-testid={`picker-flow-log-${log.strategy}`}
                data-strategy={log.strategy}
                data-outcome={log.outcome}
                style={{ marginBottom: '0.25rem' }}
              >
                <span aria-hidden>{log.scenario}</span> → <span aria-hidden>{log.picker}</span> → <span aria-hidden>{log.strategy}</span> → <span aria-hidden>{log.outcome}</span>
                {log.detail && ` (${log.detail})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
