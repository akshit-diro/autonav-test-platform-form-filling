import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import {
  getDefaultScenarioForUser,
  getStatementsPathForScenario,
  isScenarioBoundUser,
} from './routing'
import { StatementsPickerPage } from '../app/routes/StatementsPickerPage'

/**
 * Handles GET /statements (Statements menu or Download statements click).
 * - Not authenticated → login.
 * - Scenario-bound user → redirect to /statements/<defaultScenario> (skip picker).
 * - Scenario-agnostic user → show statements picker page.
 * Centralizes routing decision; no duplication with menu/button handlers.
 */
export function StatementsLanding() {
  const { user, isFullyAuthenticated } = useAuth()

  if (!isFullyAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (isScenarioBoundUser(user)) {
    const scenario = getDefaultScenarioForUser(user)
    const path = scenario ? getStatementsPathForScenario(scenario) : '/statements'
    return <Navigate to={path} replace />
  }

  return <StatementsPickerPage />
}
