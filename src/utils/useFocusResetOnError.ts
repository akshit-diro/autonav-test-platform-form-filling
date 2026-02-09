import { useEffect, useRef, type RefObject } from 'react'
import { appConfig } from '../config/appConfig'

/**
 * When focusResetOnError is true and valid flips from true to false,
 * focus moves to the target element (e.g. first field). Reflects real bank UX
 * where focus jumps back to start on validation error.
 */
export function useFocusResetOnError(
  valid: boolean,
  focusTargetRef: RefObject<HTMLElement | null>
): void {
  const prevValidRef = useRef(valid)

  useEffect(() => {
    if (!appConfig.focusResetOnError) return
    if (prevValidRef.current === true && valid === false) {
      focusTargetRef.current?.focus()
    }
    prevValidRef.current = valid
  }, [valid, focusTargetRef])
}
