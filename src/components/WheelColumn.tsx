import { useRef, useEffect, useCallback } from 'react'

const ROW_HEIGHT = 36
const CONTAINER_HEIGHT = 180
const SCROLL_END_DELAY_MS = 150

export interface WheelColumnOption {
  value: number
  label: string
}

export interface WheelColumnProps {
  options: WheelColumnOption[]
  selectedValue: number
  onSelect: (value: number) => void
  'data-testid'?: string
}

/**
 * Scroll-only wheel column. Selection changes only on scroll end (snap).
 * Clicking a row does not change selection — breaks click-only automation.
 */
export function WheelColumn({
  options,
  selectedValue,
  onSelect,
  'data-testid': testId = 'wheel-column',
}: WheelColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSyncedValueRef = useRef<number | null>(null)

  const padding = (CONTAINER_HEIGHT - ROW_HEIGHT) / 2

  const indexFromScrollTop = useCallback((scrollTop: number): number => {
    const raw = Math.round(scrollTop / ROW_HEIGHT)
    return Math.max(0, Math.min(options.length - 1, raw))
  }, [options.length])

  const scrollTopFromIndex = useCallback((index: number): number => {
    return index * ROW_HEIGHT
  }, [])

  const snapAndCommit = useCallback(() => {
    const el = scrollRef.current
    if (!el || options.length === 0) return
    const index = indexFromScrollTop(el.scrollTop)
    const targetScroll = scrollTopFromIndex(index)
    el.scrollTop = targetScroll
    onSelect(options[index].value)
  }, [options, indexFromScrollTop, scrollTopFromIndex, onSelect])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || options.length === 0) return
    if (lastSyncedValueRef.current !== null && lastSyncedValueRef.current === selectedValue) return
    lastSyncedValueRef.current = selectedValue
    const i = options.findIndex((o) => o.value === selectedValue)
    const index = i >= 0 ? i : 0
    el.scrollTop = scrollTopFromIndex(index)
  }, [selectedValue, options, scrollTopFromIndex])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function scheduleSnap() {
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
      scrollEndTimerRef.current = setTimeout(() => {
        scrollEndTimerRef.current = null
        snapAndCommit()
      }, SCROLL_END_DELAY_MS)
    }

    el.addEventListener('scroll', scheduleSnap, { passive: true })
    el.addEventListener('touchend', scheduleSnap, { passive: true })
    return () => {
      el.removeEventListener('scroll', scheduleSnap)
      el.removeEventListener('touchend', scheduleSnap)
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
    }
  }, [snapAndCommit])

  if (options.length === 0) return null

  return (
    <div
      data-testid={testId}
      role="listbox"
      aria-label="Scroll to select"
      tabIndex={0}
      ref={scrollRef}
      style={{
        height: CONTAINER_HEIGHT,
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid #ccc',
        borderRadius: 8,
        paddingTop: padding,
        paddingBottom: padding,
      }}
    >
      {options.map((opt, i) => (
        <div
          key={opt.value}
          role="option"
          aria-selected={opt.value === selectedValue}
          data-testid="wheel-option"
          data-value={opt.value}
          data-index={i}
          style={{
            height: ROW_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            scrollSnapAlign: 'center',
            scrollSnapStop: 'always',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {opt.label}
        </div>
      ))}
    </div>
  )
}
