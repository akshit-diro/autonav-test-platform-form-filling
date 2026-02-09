import { useState, useEffect, useRef } from 'react'
import { appConfig } from '../config/appConfig'

const ERROR_DISMISS_MS = 3000

/**
 * When enableAntiPatterns is true, validation error messages are shown then hidden after 3 seconds.
 * When false, errors are shown whenever hasErrors is true.
 */
export function useValidationErrorDisplay(hasErrors: boolean): boolean {
  const [dismissed, setDismissed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!hasErrors) {
      setDismissed(false)
      return
    }
    if (!appConfig.enableAntiPatterns) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDismissed(true), ERROR_DISMISS_MS)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [hasErrors])

  if (!appConfig.enableAntiPatterns) return hasErrors
  return hasErrors && !dismissed
}
