import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { credentials } from './credentials'

export interface AuthState {
  user: string | null
  allowedScenarios: string[]
}

export interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => { success: boolean; defaultRedirect?: string }
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [allowedScenarios, setAllowedScenarios] = useState<string[]>([])

  const login = useCallback((username: string, password: string) => {
    const entry = credentials[username]
    if (!entry || entry.password !== password) {
      return { success: false }
    }
    setUser(username)
    setAllowedScenarios(entry.allowedScenarios)
    return { success: true, defaultRedirect: entry.defaultRedirect }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAllowedScenarios([])
  }, [])

  const value: AuthContextValue = {
    user,
    allowedScenarios,
    login,
    logout,
    isAuthenticated: user !== null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
