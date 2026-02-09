import { useMemo, useState, useEffect } from 'react'
import { formatDate } from '../../../config/dateLocale'
import { validateRange } from '../../../utils/date-range'
import { generateDateRangeReport, downloadPdf } from '../../../utils/pdfReport'
import { getBankThemeConfig } from '../../../config/bankThemes'
import { DomNoiseDecorativeIcon } from '../../../components/DomNoise'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { useAuth } from '../../../auth/useAuth'
import { useDownloadCooldown } from '../../../utils/useDownloadCooldown'
import { useValidationErrorDisplay } from '../../../utils/useValidationErrorDisplay'
import { getPickerAdapterComponent } from '../../../components/picker-adapters'
import { stressConfig } from '../../../config/stressConfig'
import { UX_DELAYS } from '../../../config/uxDelays'
import { chaosDelay } from '../../../utils/chaos'

interface VariantFromToLayoutProps {
  pickerType: string
}

export function VariantFromToLayout({ pickerType }: VariantFromToLayoutProps) {
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [downloadReady, setDownloadReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const isCooldown = useDownloadCooldown([fromDate, toDate])
  const { requireReauthBeforeSensitiveAction } = useAuth()

  const fromInput = fromDate ? formatDate(fromDate) : ''
  const toInput = toDate ? formatDate(toDate) : ''
  const validationResult = useMemo(() => validateRange(fromInput, toInput), [fromInput, toInput])
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

  const PickerAdapter = getPickerAdapterComponent(pickerType)

  return (
    <div data-testid="variant-fromto-layout">
      <div aria-label="Date range inputs" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="variant-date-from">From</label>
          <PickerAdapter
            pickerType={pickerType}
            mode="single"
            id="variant-date-from"
            startDate={fromDate}
            onChange={(d) => setFromDate(d)}
          />
        </div>
        <div>
          <label htmlFor="variant-date-to">To</label>
          <PickerAdapter
            pickerType={pickerType}
            mode="single"
            id="variant-date-to"
            startDate={toDate}
            onChange={(d) => setToDate(d)}
          />
        </div>
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
