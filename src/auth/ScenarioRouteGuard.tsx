import { Navigate, Outlet, useParams } from 'react-router-dom'
import { getScenario } from '../config/scenarioMatrix'
import { useAuth } from './useAuth'
import { InactivityGuard } from './InactivityGuard'

/**
 * Guards /scenario/:scenarioId routes.
 * User must be logged in and have scenarioId in allowedScenarios.
 * scenarioId must exist in scenarioMatrix.
 */
export function ScenarioRouteGuard() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const { isAuthenticated, allowedScenarios } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const scenario = scenarioId ? getScenario(scenarioId) : undefined
  if (!scenario) {
    return <Navigate to="/" replace />
  }

  if (!scenarioId || !allowedScenarios.includes(scenarioId)) {
    return <Navigate to="/not-authorized" replace />
  }

  return (
    <InactivityGuard>
      <Outlet />
    </InactivityGuard>
  )
}
