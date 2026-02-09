import { useMemo, useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getScenario } from '../../config/scenarioMatrix'
import { RangeInspector } from '../../components/RangeInspector'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { stressConfig } from '../../config/stressConfig'
import { validateRange } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { PresetsScenario } from './PresetsScenario'
import { FromToScenario } from './FromToScenario'
import { DualCalendarScenario } from './DualCalendarScenario'
import { MonthYearScenario } from './MonthYearScenario'
import { YearOnlyScenario } from './YearOnlyScenario'
import { MobileWheelScenario } from './MobileWheelScenario'
import { InlineCalendarScenario } from './InlineCalendarScenario'

/** Placeholder preset ids for data-testid and future behavior. */
const PRESETS = [
  { id: 'last-7', label: 'Last 7 days' },
  { id: 'last-30', label: 'Last 30 days' },
  { id: 'this-month', label: 'This month' },
] as const

function GenericScenarioContent({ scenarioId }: { scenarioId: string }) {
  const [startInput, setStartInput] = useState('')
  const [endInput, setEndInput] = useState('')
  const [downloadReady, setDownloadReady] = useState(false)

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

  const downloadEnabled = valid && (!stressConfig.loadingSpinnerBeforeDownload || downloadReady)

  return (
    <>
      <div aria-label="Date range inputs" data-testid="date-range-inputs">
        <div>
          <label htmlFor="date-start">Start date</label>
          <input
            id="date-start"
            type="date"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            data-testid="date-start"
          />
        </div>
        <div>
          <label htmlFor="date-end">End date</label>
          <input
            id="date-end"
            type="date"
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            data-testid="date-end"
          />
        </div>
      </div>

      <div data-testid="preset-buttons" style={{ marginTop: '0.5rem' }}>
        {PRESETS.map(({ id, label }) => (
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
          data-testid="download-pdf"
          data-validation-valid={validationResult.valid}
          data-validation-errors={validationResult.errorCodes || undefined}
          onClick={async () => {
            if (!downloadEnabled || !resolvedStart || !resolvedEnd) return
            const bytes = await generateDateRangeReport(resolvedStart, resolvedEnd)
            downloadPdf(bytes)
          }}
        >
          Download PDF
        </button>
        <LoadingSpinner
          visible={valid && stressConfig.loadingSpinnerBeforeDownload && !downloadReady}
        />
      </span>

      <RangeInspector
        resolvedStart={resolvedStart}
        resolvedEnd={resolvedEnd}
        scenarioId={scenarioId}
        validationResult={validationResult}
      />
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
  const isMobileWheel = scenarioId === 'mobile-wheel'
  const isInlineCalendar = scenarioId === 'inline-calendar'

  return (
    <div>
      <h1>{scenario.displayName}</h1>
      <p>{scenario.description}</p>

      {isPresets && <PresetsScenario />}
      {isFromTo && <FromToScenario />}
      {isDualCalendar && <DualCalendarScenario />}
      {isMonthYear && <MonthYearScenario />}
      {isYearOnly && <YearOnlyScenario />}
      {isMobileWheel && <MobileWheelScenario />}
      {isInlineCalendar && <InlineCalendarScenario />}
      {!isPresets && !isFromTo && !isDualCalendar && !isMonthYear && !isYearOnly && !isMobileWheel && !isInlineCalendar && (
        <GenericScenarioContent scenarioId={scenarioId!} />
      )}

      <p>
        <Link to="/">Back to home</Link>
      </p>
    </div>
  )
}
