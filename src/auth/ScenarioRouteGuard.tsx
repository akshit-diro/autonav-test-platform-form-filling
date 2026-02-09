import { Navigate, Outlet, useParams } from 'react-router-dom'
import { getScenario, getScenarioIdFromRoute } from '../config/scenarioMatrix'
import { useAuth } from './useAuth'
import { InactivityGuard } from './InactivityGuard'

/**
 * Guards /statements/:scenarioId and /statements/:picker/:baseScenario routes.
 * Resolves effective scenarioId from either single param or picker+baseScenario.
 * User must be logged in and have scenarioId in allowedScenarios.
 */
export function ScenarioRouteGuard() {
  const { scenarioId: paramScenarioId, picker, baseScenario } = useParams<{
    scenarioId?: string
    picker?: string
    baseScenario?: string
  }>()
  const { isAuthenticated, allowedScenarios } = useAuth()

  const effectiveScenarioId =
    picker != null && baseScenario != null
      ? getScenarioIdFromRoute(picker, baseScenario)
      : paramScenarioId ?? undefined

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const scenario = effectiveScenarioId ? getScenario(effectiveScenarioId) : undefined
  if (!scenario) {
    return <Navigate to="/statements" replace />
  }

  if (!effectiveScenarioId || !allowedScenarios.includes(effectiveScenarioId)) {
    return <Navigate to="/not-authorized" replace />
  }

  return (
    <InactivityGuard>
      <Outlet />
    </InactivityGuard>
  )
}
