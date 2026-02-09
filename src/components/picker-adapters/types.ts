/**
 * Common props for picker-specific adapters.
 * Each adapter renders the actual third-party picker (Flatpickr, React Datepicker, etc.)
 * or a fallback (inputs) when the picker is not embedded.
 */

export type PickerAdapterMode = 'single' | 'range'

export interface PickerAdapterBaseProps {
  /** Picker type (e.g. FLATPICKR, REACT_DATEPICKER). */
  pickerType: string
  /** Single date or range. */
  mode: PickerAdapterMode
  /** When true, render inline (no popover). */
  inline?: boolean
  /** Disable the control. */
  disabled?: boolean
  /** Input or container id for a11y. */
  id?: string
  placeholder?: string
  /** For range: start date. For single: the date. */
  startDate: Date | null
  /** For range: end date. For single: unused. */
  endDate?: Date | null
  /** Called when user selects date(s). */
  onChange: (start: Date | null, end: Date | null) => void
  /** Min selectable date. */
  minDate?: Date | null
  /** Max selectable date. */
  maxDate?: Date | null
}

export type PickerAdapterProps = PickerAdapterBaseProps
