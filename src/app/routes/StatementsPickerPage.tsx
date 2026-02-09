import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { getScenario, scenarioIds } from '../../config/scenarioMatrix'
import { getStatementsPathForScenario } from '../../auth/routing'
import { DashboardLayout } from '../../components/DashboardLayout'

const DS_ORDER = ['DS1', 'DS2', 'DS3', 'DS4', 'DS5', 'DS6'] as const

function getTestScenarioId(scenarioId: string): string {
  const i = scenarioIds.indexOf(scenarioId)
  return i >= 0 ? `DS${i + 1}` : scenarioId
}

function getScenarioGroupKey(testScenarioId: string): string {
  return testScenarioId.split('-')[0] ?? testScenarioId
}

/**
 * Shown when a scenario-agnostic user (admin) goes to /statements.
 * Lists date-picker scenarios they are allowed to access; no redirect.
 * Tables are grouped by scenario code prefix (DS1, DS2, …).
 */
export function StatementsPickerPage() {
  const { allowedScenarios } = useAuth()

  const scenarios = allowedScenarios
    .map((id) => getScenario(id))
    .filter((s): s is NonNullable<typeof s> => s != null && s.scenarioId !== 'admin')

  const byGroup = new Map<string, typeof scenarios>()
  for (const scenario of scenarios) {
    const testId = getTestScenarioId(scenario.scenarioId)
    const key = getScenarioGroupKey(testId)
    const list = byGroup.get(key) ?? []
    list.push(scenario)
    byGroup.set(key, list)
  }

  const orderedKeys = [...byGroup.keys()].sort((a, b) => {
    const ai = DS_ORDER.indexOf(a as (typeof DS_ORDER)[number])
    const bi = DS_ORDER.indexOf(b as (typeof DS_ORDER)[number])
    if (ai >= 0 && bi >= 0) return ai - bi
    if (ai >= 0) return -1
    if (bi >= 0) return 1
    return a.localeCompare(b)
  })

  return (
    <DashboardLayout contentClassName="page--statements-picker">
      <h1>Download statements</h1>
      <p>Choose a date picker to continue.</p>
      {scenarios.length === 0 ? (
        <p data-testid="statements-picker-empty">No date picker scenarios available.</p>
      ) : (
        <div data-testid="statements-picker-list">
          {orderedKeys.map((groupKey) => (
            <section
              key={groupKey}
              className="statements-picker-group"
              aria-labelledby={`statements-picker-heading-${groupKey}`}
              data-testid={`statements-picker-group-${groupKey}`}
            >
              <h2 id={`statements-picker-heading-${groupKey}`} className="statements-picker-group__title">
                {groupKey}
              </h2>
              <table
                className="statements-picker-table"
                aria-label={`Date picker scenarios for ${groupKey}`}
              >
                <thead>
                  <tr>
                    <th scope="col">Test scenario ID</th>
                    <th scope="col">Title</th>
                    <th scope="col">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {(byGroup.get(groupKey) ?? []).map((scenario) => (
                    <tr key={scenario.scenarioId} data-testid={`statements-picker-row-${scenario.scenarioId}`}>
                      <td data-testid={`statements-picker-test-scenario-id-${scenario.scenarioId}`}>
                        {getTestScenarioId(scenario.scenarioId)}
                      </td>
                      <td>
                        <Link
                          to={getStatementsPathForScenario(scenario.scenarioId)}
                          data-testid={`statements-picker-link-${scenario.scenarioId}`}
                        >
                          {scenario.displayName}
                        </Link>
                      </td>
                      <td className="picker-description">{scenario.description ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
