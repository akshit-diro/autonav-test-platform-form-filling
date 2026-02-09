import { useEffect, useRef, useState } from 'react'
import { UX_DELAYS } from '../config/uxDelays'

/**
 * Returns true for UX_DELAYS.DISABLE_DOWNLOAD_AFTER_SELECTION_MS after deps change.
 * Use to disable the download button briefly after date selection (deterministic).
 * Cooldown is not triggered on initial mount, only when deps change.
 */
export function useDownloadCooldown(deps: unknown[]): boolean {
  const [isCooldown, setIsCooldown] = useState(false)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    const ms = UX_DELAYS.DISABLE_DOWNLOAD_AFTER_SELECTION_MS
    if (ms <= 0) return
    setIsCooldown(true)
    const t = setTimeout(() => setIsCooldown(false), ms)
    return () => clearTimeout(t)
  }, deps)

  return isCooldown
}
