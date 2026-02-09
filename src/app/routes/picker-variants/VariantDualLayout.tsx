import { useMemo, useState, useEffect } from 'react'
import { formatDate } from '../../../config/dateLocale'
import { validateRange } from '../../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../../utils/pdfReport'
import { getBankThemeConfig } from '../../../config/bankThemes'
import { DomNoiseDecorativeIcon } from '../../../components/DomNoise'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { useAuth } from '../../../auth/useAuth'
import { useDownloadCooldown } from '../../../utils/useDownloadCooldown'
import { getPickerAdapterComponent } from '../../../components/picker-adapters'
import { stressConfig } from '../../../config/stressConfig'
import { UX_DELAYS } from '../../../config/uxDelays'
import { chaosDelay } from '../../../utils/chaos'

interface VariantDualLayoutProps {
  pickerType: string
}

export function VariantDualLayout({ pickerType }: VariantDualLayoutProps) {
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

  const PickerAdapter = getPickerAdapterComponent(pickerType)

  return (
    <div data-testid="variant-dual-layout">
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: 600 }}>Date range</p>
        <PickerAdapter
          pickerType={pickerType}
          mode="range"
          inline={false}
          startDate={startDate}
          endDate={endDate}
          onChange={(start, end) => {
            setStartDate(start)
            setEndDate(end ?? null)
          }}
        />
      </div>

      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
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
