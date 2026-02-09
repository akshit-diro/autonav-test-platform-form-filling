import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { getScenario } from '../../config/scenarioMatrix'
import { getStatementsPathForScenario } from '../../auth/routing'
import { DashboardLayout } from '../../components/DashboardLayout'

/**
 * Shown when a scenario-agnostic user (admin, viewer, tester) goes to /statements.
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
      <ul data-testid="statements-picker-list" aria-label="Date picker scenarios">
        {scenarios.map((scenario) => (
          <li key={scenario.scenarioId}>
            <Link
              to={getStatementsPathForScenario(scenario.scenarioId)}
              data-testid={`statements-picker-link-${scenario.scenarioId}`}
            >
              {scenario.displayName}
            </Link>
            {scenario.description && (
              <span className="picker-description"> — {scenario.description}</span>
            )}
          </li>
        ))}
      </ul>
      {scenarios.length === 0 && (
        <p data-testid="statements-picker-empty">No date picker scenarios available.</p>
      )}
    </DashboardLayout>
  )
}
