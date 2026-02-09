import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { SESSION_CONFIG, getWarningTriggerMs } from '../config/sessionConfig'
import { useAuth } from './useAuth'

interface InactivityGuardProps {
  children: ReactNode
}

function WarningBanner({ onStayLoggedIn }: { onStayLoggedIn: () => void }) {
  return (
    <div
      role="alert"
      className="inactivity-warning"
      data-testid="inactivity-warning"
      aria-live="assertive"
    >
      <p className="inactivity-warning__text">
        You will be logged out in {SESSION_CONFIG.WARNING_BEFORE_LOGOUT_MS / 1000} seconds due to
        inactivity.
      </p>
      <button
        type="button"
        onClick={onStayLoggedIn}
        className="inactivity-warning__button"
        data-testid="inactivity-warning-stay-logged-in"
      >
        Stay logged in
      </button>
    </div>
  )
}

/**
 * Resets inactivity timer on click, keydown, scroll.
 * Shows warning before logout; on timeout clears auth and redirects to login.
 * Only runs when authenticated. Deterministic timeouts from sessionConfig.
 */
export function InactivityGuard({ children }: InactivityGuardProps) {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [showWarning, setShowWarning] = useState(false)
  const mainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (mainTimerRef.current) {
      clearTimeout(mainTimerRef.current)
      mainTimerRef.current = null
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }
  }, [])

  const scheduleLogout = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const showWarningAndScheduleLogout = useCallback(() => {
    setShowWarning(true)
    warningTimerRef.current = setTimeout(
      scheduleLogout,
      SESSION_CONFIG.WARNING_BEFORE_LOGOUT_MS
    )
  }, [scheduleLogout])

  const resetTimers = useCallback(() => {
    clearTimers()
    setShowWarning(false)
    if (!isAuthenticated) return
    mainTimerRef.current = setTimeout(showWarningAndScheduleLogout, getWarningTriggerMs())
  }, [isAuthenticated, clearTimers, showWarningAndScheduleLogout])

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers()
      setShowWarning(false)
      return
    }

    resetTimers()

    const handleActivity = () => resetTimers()

    const opts = { capture: true }
    window.addEventListener('mousedown', handleActivity, opts)
    window.addEventListener('keydown', handleActivity, opts)
    window.addEventListener('scroll', handleActivity, opts)

    return () => {
      window.removeEventListener('mousedown', handleActivity, opts)
      window.removeEventListener('keydown', handleActivity, opts)
      window.removeEventListener('scroll', handleActivity, opts)
      clearTimers()
    }
  }, [isAuthenticated, resetTimers, clearTimers])

  return (
    <>
      {children}
      {showWarning && <WarningBanner onStayLoggedIn={resetTimers} />}
    </>
  )
}
