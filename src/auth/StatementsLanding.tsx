import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { getStatementsNavigationPath, isScenarioBoundUser } from './routing'
import { StatementsPickerPage } from '../app/routes/StatementsPickerPage'

/**
 * Handles GET /statements (Statements menu or Download statements click).
 * - Not authenticated → login.
 * - Scenario-bound user → redirect to their allowed scenario route (base or variant; skip picker).
 * - Scenario-agnostic user → show statements picker page.
 * Centralizes routing decision; no duplication with menu/button handlers.
 */
export function StatementsLanding() {
  const { user, isFullyAuthenticated } = useAuth()

  if (!isFullyAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (isScenarioBoundUser(user)) {
    return <Navigate to={getStatementsNavigationPath(user)} replace />
  }

  return <StatementsPickerPage />
}
