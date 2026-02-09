import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { appConfig } from '../config/appConfig'
import { clearAll as clearStateLeakage } from '../utils/stateLeakage'
import { credentials } from './credentials'
import { ReauthModal } from './ReauthModal'

export interface AuthState {
  user: string | null
  allowedScenarios: string[]
}

export interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => { success: boolean; defaultRedirect?: string }
  logout: () => void
  isAuthenticated: boolean
  /** True when user is logged in and (if otp-simulated) OTP has been verified. */
  isFullyAuthenticated: boolean
  /** When otp-simulated: true after login until OTP is verified. */
  postLoginOtpRequired: boolean
  /** Call after user completes simulated OTP step; then navigate. */
  verifyOtp: () => void
  /** Auth flow variant from config. */
  authFlowVariant: 'simple' | 'otp-simulated' | 'reauth-on-sensitive-action'
  /** When reauth-on-sensitive-action: call before sensitive action; resolves true if reauth succeeded, false if cancelled. */
  requireReauthBeforeSensitiveAction: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [allowedScenarios, setAllowedScenarios] = useState<string[]>([])
  const [otpVerified, setOtpVerified] = useState(false)
  const [postLoginOtpRequired, setPostLoginOtpRequired] = useState(false)
  const [reauthModalOpen, setReauthModalOpen] = useState(false)
  const reauthResolveRef = useRef<((value: boolean) => void) | null>(null)

  const authFlowVariant = appConfig.authFlowVariant

  const login = useCallback((username: string, password: string) => {
    const entry = credentials[username]
    if (!entry || entry.password !== password) {
      return { success: false }
    }
    setUser(username)
    setAllowedScenarios(entry.allowedScenarios)
    setOtpVerified(false)
    if (authFlowVariant === 'otp-simulated') {
      setPostLoginOtpRequired(true)
    }
    return { success: true, defaultRedirect: entry.defaultRedirect }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAllowedScenarios([])
    setOtpVerified(false)
    setPostLoginOtpRequired(false)
    setReauthModalOpen(false)
    if (reauthResolveRef.current) {
      reauthResolveRef.current(false)
      reauthResolveRef.current = null
    }
    clearStateLeakage()
  }, [])

  const verifyOtp = useCallback(() => {
    setOtpVerified(true)
    setPostLoginOtpRequired(false)
  }, [])

  const requireReauthBeforeSensitiveAction = useCallback((): Promise<boolean> => {
    if (authFlowVariant !== 'reauth-on-sensitive-action' || !user) {
      return Promise.resolve(true)
    }
    return new Promise<boolean>((resolve) => {
      reauthResolveRef.current = resolve
      setReauthModalOpen(true)
    })
  }, [authFlowVariant, user])

  const handleReauthConfirm = useCallback(
    (password: string): boolean => {
      if (!user) return false
      const entry = credentials[user]
      if (!entry || entry.password !== password) return false
      setReauthModalOpen(false)
      if (reauthResolveRef.current) {
        reauthResolveRef.current(true)
        reauthResolveRef.current = null
      }
      return true
    },
    [user]
  )

  const handleReauthCancel = useCallback(() => {
    setReauthModalOpen(false)
    if (reauthResolveRef.current) {
      reauthResolveRef.current(false)
      reauthResolveRef.current = null
    }
  }, [])

  const isFullyAuthenticated =
    user !== null &&
    (authFlowVariant !== 'otp-simulated' || otpVerified)

  const value: AuthContextValue = {
    user,
    allowedScenarios,
    login,
    logout,
    isAuthenticated: user !== null,
    isFullyAuthenticated,
    postLoginOtpRequired,
    verifyOtp,
    authFlowVariant,
    requireReauthBeforeSensitiveAction,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ReauthModal
        open={reauthModalOpen}
        onConfirm={handleReauthConfirm}
        onCancel={handleReauthCancel}
      />
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
