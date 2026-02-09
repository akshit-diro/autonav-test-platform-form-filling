import { useAuthContext } from './AuthContext'

/**
 * Hook to access auth state and actions.
 * Must be used within AuthProvider.
 */
export function useAuth() {
  return useAuthContext()
}
