import { useMemo, useState, useEffect } from 'react'
import { formatDate } from '../../../config/dateLocale'
import { validateRange, presetFns, type PresetId } from '../../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../../utils/pdfReport'
import { getBankThemeConfig } from '../../../config/bankThemes'
import { DomNoiseDecorativeIcon } from '../../../components/DomNoise'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { useAuth } from '../../../auth/useAuth'
import { useDownloadCooldown } from '../../../utils/useDownloadCooldown'
import { useValidationErrorDisplay } from '../../../utils/useValidationErrorDisplay'
import { getPickerAdapterComponent } from '../../../components/picker-adapters'
import { appConfig } from '../../../config/appConfig'
import { stressConfig } from '../../../config/stressConfig'
import { UX_DELAYS } from '../../../config/uxDelays'
import { chaosDelay, chaosShuffled } from '../../../utils/chaos'

const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'last-7', label: 'Last 7 days' },
  { id: 'last-30', label: 'Last 30 days' },
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: 'ytd', label: 'YTD' },
]

interface VariantPresetsLayoutProps {
  pickerType: string
}

export function VariantPresetsLayout({ pickerType }: VariantPresetsLayoutProps) {
  const [customOpen, setCustomOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([startDate, endDate])
  const { requireReauthBeforeSensitiveAction } = useAuth()

  const startInput = startDate ? formatDate(startDate) : ''
  const endInput = endDate ? formatDate(endDate) : ''
  const validationResult = useMemo(() => validateRange(startInput, endInput), [startInput, endInput])
  const valid = validationResult.valid
  const resolvedStart = validationResult.range?.start
  const resolvedEnd = validationResult.range?.end
  const hasValidationErrors = !valid && validationResult.errors.length > 0
  const showValidationErrors = useValidationErrorDisplay(hasValidationErrors)

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

  function applyRange(start: Date, end: Date) {
    setStartDate(start)
    setEndDate(end)
  }

  async function handlePreset(id: PresetId) {
    const fn = presetFns[id]
    if (!fn) return
    setCustomOpen(false)
    const { start, end } = fn()
    applyRange(start, end)
    await chaosDelay(stressConfig.uiDelayMs)
  }

  const PickerAdapter = getPickerAdapterComponent(pickerType)
  const displayPresets = useMemo(
    () => (appConfig.chaosLevel >= 1 ? chaosShuffled(PRESETS) : PRESETS),
    []
  )

  return (
    <div data-testid="variant-presets-layout">
      <div data-testid="preset-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {displayPresets.map(({ id, label }) => (
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
        <div data-testid="picker-adapter-container" style={{ marginTop: '1rem' }}>
          <PickerAdapter
            pickerType={pickerType}
            mode="range"
            inline
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start)
              setEndDate(end ?? null)
            }}
          />
        </div>
      )}

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

      <span style={{ display: 'inline-flex', alignItems: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          disabled={!downloadEnabled}
          data-testid="download-pdf"
          data-validation-valid={validationResult.valid}
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
        <LoadingSpinner visible={generatingPdf || (valid && stressConfig.loadingSpinnerBeforeDownload && !downloadReady)} />
      </span>
    </div>
  )
}
