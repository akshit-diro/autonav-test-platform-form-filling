import { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { InactivityGuard } from './InactivityGuard'

interface ProtectedRouteProps {
  /** If set, user must have this scenario in allowedScenarios or they see NotAuthorized. */
  requiredScenario?: string
  /** Use custom content instead of Outlet (e.g. for a single protected page). */
  children?: ReactNode
}

/**
 * Protects routes by requiring login and optionally a scenario.
 * Not logged in → redirect to /login.
 * Logged in but missing requiredScenario → redirect to /not-authorized.
 */
export function ProtectedRoute({ requiredScenario, children }: ProtectedRouteProps) {
  const location = useLocation()
  const { isFullyAuthenticated, allowedScenarios } = useAuth()

  if (!isFullyAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredScenario !== undefined && !allowedScenarios.includes(requiredScenario)) {
    return <Navigate to="/not-authorized" replace />
  }

  const content = children ?? <Outlet />
  return <InactivityGuard>{content}</InactivityGuard>
}
