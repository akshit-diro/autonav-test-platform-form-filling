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
import { validateRange, presetFns, type PresetId } from '../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../utils/pdfReport'
import { chaosDelay, chaosShuffled } from '../../utils/chaos'
import { useAuth } from '../../auth/useAuth'
import { useDownloadCooldown } from '../../utils/useDownloadCooldown'
import { useFocusResetOnError } from '../../utils/useFocusResetOnError'
import {
  getLastDateRange,
  setLastDateRange,
  getLastCalendarMonth,
  setLastCalendarMonth,
} from '../../utils/stateLeakage'
import { isDateDisabledAfterSelection } from '../../utils/stressDisabledDates'

const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'last-7', label: 'Last 7 days' },
  { id: 'last-30', label: 'Last 30 days' },
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: 'ytd', label: 'YTD' },
]

function getInitialRange(): { from: string; to: string } {
  const r = getLastDateRange()
  return { from: r?.from ?? '', to: r?.to ?? '' }
}

function getInitialCalendarMonth(): Date {
  const m = getLastCalendarMonth()
  return m ? new Date(m + '-01') : new Date()
}

export function PresetsScenario() {
  const [startInput, setStartInput] = useState(() => getInitialRange().from)
  const [endInput, setEndInput] = useState(() => getInitialRange().to)
  const [customOpen, setCustomOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => getInitialCalendarMonth())
  const [pendingEnd, setPendingEnd] = useState<Date | null>(null)
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([startInput, endInput])
  const downloadButtonRef = useRef<HTMLButtonElement>(null)
  const firstPresetRef = useRef<HTMLButtonElement>(null)

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
  useFocusResetOnError(valid, firstPresetRef)

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

  async function handlePreset(id: PresetId) {
    const fn = presetFns[id]
    if (!fn) return
    const { start, end } = fn()
    applyRange(start, end)
    await chaosDelay(stressConfig.uiDelayMs)
    if (appConfig.enableKeyboardTraps) {
      setTimeout(() => downloadButtonRef.current?.focus(), 0)
    }
  }

  async function handleCalendarDay(date: Date) {
    if (!pendingEnd) {
      setPendingEnd(date)
      applyRange(date, date)
      await chaosDelay(stressConfig.uiDelayMs)
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

  const { requireReauthBeforeSensitiveAction } = useAuth()

  const displayPresets = useMemo(
    () => (appConfig.chaosLevel >= 1 ? chaosShuffled(PRESETS) : PRESETS),
    []
  )

  return (
    <div>
      <div data-testid="preset-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {displayPresets.map(({ id, label }, index) => (
          <button
            key={id}
            ref={index === 0 ? firstPresetRef : undefined}
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
          <PickerContainer>
            <SimpleCalendar
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              start={resolvedStart ?? null}
              end={resolvedEnd ?? null}
              onSelectDay={(d) => void handleCalendarDay(d)}
              isDayDisabled={isDayDisabled}
            />
          </PickerContainer>
        </div>
      )}

      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <button
          ref={downloadButtonRef}
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
