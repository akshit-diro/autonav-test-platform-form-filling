import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { getDefaultRedirectForUser } from './routing'

/**
 * Redirects to the authenticated user's default date-picker scenario (/statements/<scenario>).
 * If not authenticated, redirects to login.
 */
export function RedirectToDefaultScenario() {
  const { user, isFullyAuthenticated } = useAuth()

  if (!isFullyAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const redirect = getDefaultRedirectForUser(user)
  return <Navigate to={redirect} replace />
}
