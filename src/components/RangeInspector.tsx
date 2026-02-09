import type { DateRangeValidationResult } from '../utils/date-range'

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export interface RangeInspectorProps {
  /** Resolved start date; undefined when not set or invalid. */
  resolvedStart: Date | undefined
  /** Resolved end date; undefined when not set or invalid. */
  resolvedEnd: Date | undefined
  /** Current scenario id from route. */
  scenarioId: string
  /** Result from validateRange(); use when dates have been validated. */
  validationResult: DateRangeValidationResult
}

/**
 * Debug/inspection panel for date range state and validation.
 * Helps humans debug while exposing machine-readable state for automation.
 */
export function RangeInspector({
  resolvedStart,
  resolvedEnd,
  scenarioId,
  validationResult,
}: RangeInspectorProps) {
  const { valid, errors, errorCodes } = validationResult

  return (
    <section
      data-testid="range-inspector"
      data-validation-valid={valid}
      data-validation-errors={errorCodes || undefined}
      aria-label="Range debug inspector"
      style={{
        marginTop: '1.5rem',
        padding: '0.75rem 1rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '0.875rem',
        fontFamily: 'monospace',
        backgroundColor: '#f8f8f8',
      }}
    >
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
        Range inspector
      </h3>
      <dl style={{ margin: 0, display: 'grid', gap: '0.25rem 1rem', gridTemplateColumns: 'auto 1fr' }}>
        <dt>Resolved start</dt>
        <dd data-testid="inspector-resolved-start" style={{ margin: 0 }}>
          {resolvedStart != null ? formatDate(resolvedStart) : '—'}
        </dd>
        <dt>Resolved end</dt>
        <dd data-testid="inspector-resolved-end" style={{ margin: 0 }}>
          {resolvedEnd != null ? formatDate(resolvedEnd) : '—'}
        </dd>
        <dt>Scenario ID</dt>
        <dd data-testid="inspector-scenario-id" style={{ margin: 0 }}>
          {scenarioId}
        </dd>
        <dt>Validation status</dt>
        <dd data-testid="inspector-validation-status" style={{ margin: 0 }}>
          {valid ? 'Valid' : 'Invalid'}
        </dd>
      </dl>
      {errors.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <strong>Active validation errors</strong>
          <ul
            data-testid="inspector-validation-errors"
            data-validation-errors={errorCodes}
            style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem' }}
          >
            {errors.map((e) => (
              <li key={e.code}>
                <span data-testid={`inspector-error-${e.code}`}>
                  [{e.code}] {e.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
