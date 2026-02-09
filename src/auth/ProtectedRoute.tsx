import { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

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
  const { isAuthenticated, allowedScenarios } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredScenario !== undefined && !allowedScenarios.includes(requiredScenario)) {
    return <Navigate to="/not-authorized" replace />
  }

  return children ?? <Outlet />
}
