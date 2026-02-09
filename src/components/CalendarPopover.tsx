import { useState, useEffect, useRef } from 'react'
import { SimpleCalendar } from './SimpleCalendar'
import { PickerContainer } from './PickerContainer'
import { useFocusTrap } from '../utils/useFocusTrap'

export interface CalendarPopoverProps {
  open: boolean
  onClose: () => void
  /** Currently selected date (for display); null when empty. */
  value: Date | null
  /** Called when user selects a day; popover closes after. */
  onSelectDate: (date: Date) => void
  /** When provided, dates for which this returns true are disabled. */
  isDayDisabled?: (date: Date) => boolean
  /** Id for the trigger (for aria-describedby etc.). */
  id?: string
  /** data-testid for the popover container. */
  'data-testid'?: string
}

/**
 * Popover that shows a single-month calendar. One click selects the date and closes.
 * Reuses SimpleCalendar with start=end=value for single-date mode.
 */
export function CalendarPopover({
  open,
  onClose,
  value,
  onSelectDate,
  isDayDisabled,
  id,
  'data-testid': testId = 'calendar-popover',
}: CalendarPopoverProps) {
  const [month, setMonth] = useState(() => value ?? new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && value) setMonth(value)
  }, [open, value])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  useFocusTrap(containerRef, open, onClose)

  function handleSelectDay(date: Date) {
    onSelectDate(date)
    onClose()
  }

  if (!open) return null

  return (
    <div
      ref={containerRef}
      id={id}
      data-testid={testId}
      role="dialog"
      aria-label="Choose date"
      style={{
        position: 'absolute',
        zIndex: 1000,
        marginTop: 2,
        padding: 8,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <PickerContainer>
        <SimpleCalendar
          month={month}
          onMonthChange={setMonth}
          start={value}
          end={value}
          onSelectDay={handleSelectDay}
          isDayDisabled={isDayDisabled}
        />
      </PickerContainer>
    </div>
  )
}
