import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { getScenario, scenarioIds } from '../../config/scenarioMatrix'
import { getStatementsPathForScenario } from '../../auth/routing'
import { DashboardLayout } from '../../components/DashboardLayout'

function getTestScenarioId(scenarioId: string): string {
  const i = scenarioIds.indexOf(scenarioId)
  return i >= 0 ? `DS${i + 1}` : scenarioId
}

/**
 * Shown when a scenario-agnostic user (admin) goes to /statements.
 * Lists date-picker scenarios they are allowed to access; no redirect.
 */
export function StatementsPickerPage() {
  const { allowedScenarios } = useAuth()

  const scenarios = allowedScenarios
    .map((id) => getScenario(id))
    .filter((s): s is NonNullable<typeof s> => s != null && s.scenarioId !== 'admin')

  return (
    <DashboardLayout contentClassName="page--statements-picker">
      <h1>Download statements</h1>
      <p>Choose a date picker to continue.</p>
      {scenarios.length === 0 ? (
        <p data-testid="statements-picker-empty">No date picker scenarios available.</p>
      ) : (
        <table
          className="statements-picker-table"
          data-testid="statements-picker-list"
          aria-label="Date picker scenarios"
        >
          <thead>
            <tr>
              <th scope="col">Test scenario ID</th>
              <th scope="col">Title</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario) => (
              <tr key={scenario.scenarioId} data-testid={`statements-picker-row-${scenario.scenarioId}`}>
                <td data-testid={`statements-picker-test-scenario-id-${scenario.scenarioId}`}>{getTestScenarioId(scenario.scenarioId)}</td>
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
      )}
    </DashboardLayout>
  )
}
