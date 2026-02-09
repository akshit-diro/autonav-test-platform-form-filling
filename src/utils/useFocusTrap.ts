import { useEffect, type RefObject } from 'react'
import { appConfig } from '../config/appConfig'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusablesInRoot(root: Document | DocumentFragment | Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('aria-hidden')
  )
}

function getFocusables(container: HTMLElement): HTMLElement[] {
  const list: HTMLElement[] = []
  list.push(...getFocusablesInRoot(container))
  const host = container.querySelector('[data-picker-root]')?.getRootNode()
  if (host && host instanceof ShadowRoot) {
    list.push(...getFocusablesInRoot(host))
  }
  container.querySelectorAll('iframe').forEach((iframe) => {
    try {
      const doc = iframe.contentDocument
      if (doc?.body) list.push(...getFocusablesInRoot(doc))
    } catch {
      // cross-origin or not loaded
    }
  })
  return list
}

/**
 * When enableKeyboardTraps is true: Tab cycles inside the container (focus trap),
 * Escape calls onEscape. Does not fully block keyboard users (Escape still closes).
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onEscape: () => void
): void {
  useEffect(() => {
    if (!appConfig.enableKeyboardTraps || !enabled) return
    const container = containerRef.current
    if (!container) return

    function handleKeyDown(e: KeyboardEvent) {
      const host = containerRef.current
      if (!host) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape()
        return
      }
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement
        const isDayButton = target.closest('[role="gridcell"]')?.querySelector('button') === target
        if (!isDayButton) {
          e.preventDefault()
          onEscape()
        }
        return
      }
      if (e.key !== 'Tab') return

      const focusables = getFocusables(host)
      if (focusables.length === 0) return

      const current = document.activeElement as HTMLElement | null
      const currentIndex = current ? focusables.indexOf(current) : -1

      if (e.shiftKey) {
        if (currentIndex <= 0) {
          e.preventDefault()
          focusables[focusables.length - 1].focus()
        }
      } else {
        if (currentIndex === -1 || currentIndex >= focusables.length - 1) {
          e.preventDefault()
          focusables[0].focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown, true)
    return () => container.removeEventListener('keydown', handleKeyDown, true)
  }, [containerRef, enabled, onEscape])
}
