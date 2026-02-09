/**
 * Picker detection and strategy-mapping types.
 * Keeps picker-specific logic isolated behind a common abstraction.
 */

/** Supported date picker library identifiers. Align with scenario registry picker codes. */
export type PickerType =
  | 'FLATPICKR'
  | 'PIKADAY'
  | 'AIR_DATEPICKER'
  | 'JQUERY_UI'
  | 'BOOTSTRAP_UX'
  | 'DATERANGEPICKER'
  | 'LITEPICKER'
  | 'REACT_DATEPICKER'
  | 'MUI'
  | 'ANTD'
  | 'REACT_DAY_PICKER'
  | 'ANGULAR_MATERIAL'
  | 'PRIMENG'
  | 'KENDO'
  | 'SYNCFUSION'
  | 'DEVEXPRESS'
  | 'CARBON'
  | 'CLARITY'
  | 'SEMANTIC_UI'
  | 'MOBISCROLL'
  | 'IONIC'

/** Base scenario ids (DS1–DS6) this picker variant can support. */
export type BaseScenarioId = 'DS1' | 'DS2' | 'DS3' | 'DS4' | 'DS5' | 'DS6'

/**
 * Root document or shadow root where the picker was detected.
 * Enables operations across portals, shadow DOM, and iframes.
 */
export type PickerRoot = Document | ShadowRoot

/**
 * Result of picker detection. Provides root and optional trigger/container
 * for subsequent open/setDate/confirm/validate operations.
 */
export interface DetectionResult {
  pickerType: PickerType
  /** Document or shadow root containing the picker. */
  root: PickerRoot
  /** Input or button that opens the picker (when known). */
  triggerElement?: Element
  /** Calendar/panel element (when already open or inline). */
  panelElement?: Element
  /** Confidence 0–1; used to disambiguate when multiple heuristics match. */
  confidence: number
}

/**
 * Heuristics to detect a picker in a given root. All checks are scoped to
 * the root (document, shadow root, or iframe document). Detection must be
 * resilient to portals, shadow DOM, and iframe embedding.
 */
export interface DetectionHeuristics {
  /**
   * CSS selectors that indicate this picker. First match in root wins.
   * Prefer data attributes or stable class names to avoid false positives.
   */
  selectors?: string[]
  /**
   * ARIA role or combobox/listbox patterns. Use when picker exposes roles.
   */
  ariaRoles?: string[]
  /**
   * Class name substrings or patterns (tested via element.className or classList).
   */
  classPatterns?: Array<string | RegExp>
  /**
   * Data attribute presence (e.g. data-flatpickr, data-testid).
   */
  dataAttributes?: string[]
  /**
   * When true, also check root's defaultView (window) for a known global
   * (e.g. window.flatpickr). Only reliable when root is the same-origin
   * document that loaded the picker script.
   */
  globalCheck?: string
}

/**
 * Strategy to open the picker. Prefer direct DOM/ARIA over script injection.
 * No hardcoded delays; use MutationObserver or retry logic if waiting is needed.
 */
export interface OpenStrategy {
  /** How to open: click trigger, focus input, or invoke API. */
  type: 'click_trigger' | 'focus_input' | 'focus_then_click' | 'api_open' | 'already_inline'
  /**
   * Selector relative to root to find trigger (input, button, or calendar wrapper).
   * For focus_input, this is the input element.
   */
  triggerSelector?: string
  /** Optional fallback selector if primary is inside shadow/portal. */
  fallbackTriggerSelector?: string
  /** For api_open: name of method to call on trigger (e.g. 'open'). */
  apiMethod?: string
  /** Framework/rendering notes (React portal, Angular overlay, etc.). */
  notes?: string
}

/**
 * Strategy to set a date (single or range). May target input value or
 * calendar day elements depending on picker.
 */
export interface SetDateStrategy {
  type: 'input_value' | 'click_day' | 'api_setDate' | 'type_then_select'
  /** Selector for input(s) to set value. */
  inputSelector?: string
  /** For range: second input selector. */
  endInputSelector?: string
  /** For click_day: selector for day cell (e.g. .flatpickr-day). */
  daySelector?: string
  /** date-fns-style format for input value (e.g. yyyy-MM-dd). */
  inputFormat?: string
  apiMethod?: string
  notes?: string
}

/**
 * Strategy to confirm selection (e.g. Apply button, Enter, or close).
 */
export interface ConfirmStrategy {
  type: 'click_apply' | 'press_enter' | 'click_done' | 'blur_or_close' | 'none'
  /** Selector for Apply/Done/OK button. */
  buttonSelector?: string
  fallbackButtonSelector?: string
  notes?: string
}

/**
 * Strategy to validate that the picker is in the expected state.
 */
export interface ValidateStrategy {
  type: 'input_has_value' | 'aria_selected' | 'class_has_selected' | 'api_value' | 'none'
  inputSelector?: string
  selectedDaySelector?: string
  notes?: string
}

/**
 * Fallback strategies when primary strategy fails (e.g. mobile vs desktop UI).
 */
export interface FallbackStrategies {
  open?: OpenStrategy[]
  setDate?: SetDateStrategy[]
  confirm?: ConfirmStrategy[]
  validate?: ValidateStrategy[]
}

/**
 * Full configuration for one picker type. All strategies and detection
 * heuristics are isolated per picker.
 */
export interface PickerConfig {
  pickerType: PickerType
  /** Detection heuristics; order may affect precedence in multi-picker pages. */
  detection: DetectionHeuristics
  /** Preferred way to open the picker. */
  openStrategy: OpenStrategy
  /** Preferred way to set date(s). */
  setDateStrategy: SetDateStrategy
  /** Preferred way to confirm selection. */
  confirmStrategy: ConfirmStrategy
  /** How to validate current selection. */
  validateStrategy: ValidateStrategy
  /** Base scenarios (DS1–DS6) this picker is known to support. */
  supportedBaseScenarios: BaseScenarioId[]
  /** Fallbacks for mobile, overlays, or alternate DOM structures. */
  fallbackStrategies?: FallbackStrategies
  /**
   * Inline documentation: quirks, framework notes (React portals, Angular
   * CDK overlay), shadow DOM usage, and risks (e.g. z-index, focus trap).
   */
  documentation?: string
}

export interface ValidationResult {
  valid: boolean
  message?: string
  value?: string
}

/**
 * Registry abstraction: detect picker in scope, then open/setDate/confirm/validate
 * using the mapped strategy for that picker type. No hardcoded delays; logic
 * is isolated per picker via PickerConfig.
 */
export interface PickerRegistryInterface {
  detect(scope?: Document | Element): DetectionResult | null
  open(context: DetectionResult): void
  setDate(context: DetectionResult, date: Date, endDate?: Date): void
  confirm(context: DetectionResult): void
  validate(context: DetectionResult): ValidationResult
}
