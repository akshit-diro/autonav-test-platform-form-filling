import { useMemo, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { SimpleCalendar } from '../../components/SimpleCalendar'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { stressConfig } from '../../config/stressConfig'
import { UX_DELAYS } from '../../config/uxDelays'
import { validateRange, presetFns, type PresetId } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { delay } from '../../utils/delay'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'
import { isDateDisabledAfterSelection } from '../../utils/stressDisabledDates'

const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'last-7', label: 'Last 7 days' },
  { id: 'last-30', label: 'Last 30 days' },
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: 'ytd', label: 'YTD' },
]

export function PresetsScenario() {
  const [startInput, setStartInput] = useState('')
  const [endInput, setEndInput] = useState('')
  const [customOpen, setCustomOpen] = useState(false)
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

  async function handlePreset(id: PresetId) {
    const fn = presetFns[id]
    if (!fn) return
    const { start, end } = fn()
    applyRange(start, end)
    await delay(stressConfig.uiDelayMs)
  }

  async function handleCalendarDay(date: Date) {
    if (!pendingEnd) {
      setPendingEnd(date)
      applyRange(date, date)
      await delay(stressConfig.uiDelayMs)
      return
    }
    const start = new Date(pendingEnd)
    const end = date
    if (start.getTime() > end.getTime()) {
      applyRange(end, start)
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
      <div data-testid="preset-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {PRESETS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            data-testid={`preset-${id}`}
            onClick={() => void handlePreset(id)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          data-testid="preset-custom"
          onClick={() => setCustomOpen((o) => !o)}
          aria-expanded={customOpen}
        >
          Custom range
        </button>
      </div>

      {customOpen && (
        <div data-testid="calendar-placeholder" style={{ marginTop: '1rem' }}>
          <SimpleCalendar
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            start={resolvedStart ?? null}
            end={resolvedEnd ?? null}
            onSelectDay={(d) => void handleCalendarDay(d)}
            isDayDisabled={isDayDisabled}
          />
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
