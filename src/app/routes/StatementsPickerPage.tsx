import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import {
  getScenario,
  getTestScenarioId,
  scenarioIds,
  PICKER_REGISTRY,
} from '../../config/scenarioMatrix'
import { getStatementsPathForScenario } from '../../auth/routing'
import { DashboardLayout } from '../../components/DashboardLayout'

/** Base scenario indices that have picker variants (DS1, DS2, DS3, DS6). */
const BASE_INDICES_WITH_VARIANTS = [0, 1, 2, 5] as const
/** Table columns: only base cases that have variants. */
const TABLE_COLUMN_INDICES = [...BASE_INDICES_WITH_VARIANTS]
/** Base-only scenarios (DS4, DS5): shown outside the table. */
const BASE_ONLY_INDICES = [3, 4] as const

/** Scenario ID for variant: base scenario index (0–5) + picker code (e.g. DS1-FLATPICKR). */
function getVariantScenarioId(baseIndex: number, pickerCode: string): string {
  return `DS${baseIndex + 1}-${pickerCode}`
}

type RowKind = { type: 'base' } | { type: 'picker'; pickerCode: string; pickerDisplayName: string }

/**
 * Shown when a scenario-agnostic user (admin) goes to /statements.
 * Single matrix: rows = variants (Base + picker types), columns = base cases (DS1–DS6),
 * cells = test-scenario IDs (clickable links to the scenario page).
 */
export function StatementsPickerPage() {
  const { allowedScenarios } = useAuth()
  const allowedSet = new Set(allowedScenarios)

  const scenarios = allowedScenarios
    .map((id) => getScenario(id))
    .filter((s): s is NonNullable<typeof s> => s != null && s.scenarioId !== 'admin')

  if (scenarios.length === 0) {
    return (
      <DashboardLayout contentClassName="page--statements-picker">
        <h1>Download statements</h1>
        <p>Choose a date picker to continue.</p>
        <p data-testid="statements-picker-empty">No date picker scenarios available.</p>
      </DashboardLayout>
    )
  }

  const tableColumnLabels = TABLE_COLUMN_INDICES.map((i) => `DS${i + 1}`)

  const pickersForStatements = PICKER_REGISTRY.filter((p) => p.code !== 'SEMANTIC_UI')
  const rows: RowKind[] = [
    { type: 'base' },
    ...pickersForStatements.map((p) => ({
      type: 'picker' as const,
      pickerCode: p.code,
      pickerDisplayName: p.displayName,
    })),
  ]

  const getCellScenarioId = (row: RowKind, tableColIndex: number): string | null => {
    const baseIndex = TABLE_COLUMN_INDICES[tableColIndex]
    if (baseIndex == null) return null
    if (row.type === 'base') return scenarioIds[baseIndex] ?? null
    return getVariantScenarioId(baseIndex, row.pickerCode)
  }

  return (
    <DashboardLayout contentClassName="page--statements-picker">
      <h1>Download statements</h1>
      <p>Choose a date picker to continue. Rows are variants, columns are base cases; click a test-scenario ID to open that scenario.</p>
      <div data-testid="statements-picker-list" className="statements-picker-matrix-wrap">
        <table
          className="statements-picker-table statements-picker-table--matrix"
          aria-label="Date picker scenarios by variant and base case"
        >
          <thead>
            <tr>
              <th scope="col" className="statements-picker-table__row-header statements-picker-table__variant-header" aria-label="Variant ID">
                ID
              </th>
              <th scope="col" className="statements-picker-table__row-header statements-picker-table__variant-header">
                Variant
              </th>
              {tableColumnLabels.map((label) => (
                <th key={label} scope="col" data-testid={`statements-picker-col-${label}`}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              let variantIdCounter = 0
              return rows.map((row) => {
                const rowLabel = row.type === 'base' ? 'Base' : row.pickerDisplayName
                const rowTestId = row.type === 'base' ? 'base' : row.pickerCode
                const hasAnyAllowedInRow = tableColumnLabels.some((_, colIndex) => {
                  const sid = getCellScenarioId(row, colIndex)
                  return sid != null && allowedSet.has(sid)
                })
                if (!hasAnyAllowedInRow) return null

                variantIdCounter += 1
                const variantId = variantIdCounter

                return (
                  <tr key={rowTestId} data-testid={`statements-picker-row-${rowTestId}`}>
                    <th scope="row" className="statements-picker-table__row-header statements-picker-table__variant-cell" data-testid={`statements-picker-variant-id-${variantId}`}>
                      {variantId}
                    </th>
                    <th scope="row" className="statements-picker-table__row-header statements-picker-table__variant-cell">
                      <span className="statements-picker-table__variant-name">{rowLabel}</span>
                    </th>
                    {tableColumnLabels.map((label, colIndex) => {
                      const scenarioId = getCellScenarioId(row, colIndex)
                      const allowed = scenarioId != null && allowedSet.has(scenarioId)
                      const cellLabel = scenarioId ? getTestScenarioId(scenarioId) : '—'

                      return (
                        <td
                          key={label}
                          data-testid={
                            scenarioId
                              ? `statements-picker-cell-${rowTestId}-${label}`
                              : undefined
                          }
                        >
                          {allowed && scenarioId ? (
                            <Link
                              to={getStatementsPathForScenario(scenarioId)}
                              data-testid={`statements-picker-link-${scenarioId}`}
                            >
                              {cellLabel}
                            </Link>
                          ) : (
                            <span aria-hidden>{cellLabel}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            })()}
          </tbody>
        </table>
      </div>
      {BASE_ONLY_INDICES.some((i) => allowedSet.has(scenarioIds[i]!)) && (
        <section className="statements-picker-base-only" aria-label="Base-only scenarios" data-testid="statements-picker-base-only">
          <h2 className="statements-picker-base-only__title">Base only (no picker variants)</h2>
          <ul className="statements-picker-base-only__list">
            {BASE_ONLY_INDICES.map((i) => {
              const scenarioId = scenarioIds[i]!
              const scenario = getScenario(scenarioId)
              const testScenarioId = getTestScenarioId(scenarioId)
              if (!allowedSet.has(scenarioId)) return null
              return (
                <li key={scenarioId} data-testid={`statements-picker-base-only-${testScenarioId}`}>
                  <Link
                    to={getStatementsPathForScenario(scenarioId)}
                    data-testid={`statements-picker-link-${scenarioId}`}
                  >
                    {testScenarioId}
                  </Link>
                  {scenario?.displayName != null && (
                    <span className="statements-picker-base-only__name"> — {scenario.displayName}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}
      <section className="statements-picker-legend" aria-label="Base case quick reference" data-testid="statements-picker-legend">
        <h2 className="statements-picker-legend__title">Base cases (quick reference)</h2>
        <dl className="statements-picker-legend__list">
          {scenarioIds.map((id, i) => {
            const scenario = getScenario(id)
            const label = `DS${i + 1}`
            return (
              <div key={id} className="statements-picker-legend__item" data-testid={`statements-picker-legend-${label}`}>
                <dt className="statements-picker-legend__term">{label}</dt>
                <dd className="statements-picker-legend__desc">
                  <strong>{scenario?.displayName ?? id}</strong>
                  {scenario?.description != null && (
                    <> — {scenario.description}</>
                  )}
                </dd>
              </div>
            )
          })}
        </dl>
      </section>
    </DashboardLayout>
  )
}
