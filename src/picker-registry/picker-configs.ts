/**
 * Per-picker configuration: detection heuristics, strategies, and documentation.
 * Picker-specific logic is isolated here; registry uses these configs only.
 * Base scenarios DS1–DS6: Presets, From–To, Dual calendar, Month & year, Year only, Inline calendar.
 */

import type { PickerConfig, OpenStrategy, FallbackStrategies } from './types'

const ALL_BASE_SCENARIOS: PickerConfig['supportedBaseScenarios'] = ['DS1', 'DS2', 'DS3', 'DS4', 'DS5', 'DS6']

function fallbackOpen(openStrategy: OpenStrategy): FallbackStrategies {
  return { open: [openStrategy] }
}

export const PICKER_CONFIGS: PickerConfig[] = [
  {
    pickerType: 'FLATPICKR',
    detection: {
      selectors: ['.flatpickr', '[data-fp-type]', '.flatpickr-input'],
      classPatterns: ['flatpickr'],
      dataAttributes: ['fp-type', 'data-fp-type'],
      globalCheck: 'flatpickr',
    },
    openStrategy: {
      type: 'focus_input',
      triggerSelector: '.flatpickr-input, input.flatpickr',
      notes: 'Renders inline or in a portal; calendar has .flatpickr-calendar. Mobile: may use different wrapper.',
    },
    setDateStrategy: {
      type: 'api_setDate',
      inputFormat: 'yyyy-MM-dd',
      apiMethod: 'setDate',
      notes: 'Prefer instance.setDate(). Fallback: set input value then trigger change.',
    },
    confirmStrategy: { type: 'click_done', buttonSelector: '.flatpickr-day.selected', notes: 'Single-date: selecting day closes. Range: select end day.' },
    validateStrategy: { type: 'input_has_value', inputSelector: '.flatpickr-input', notes: 'Input holds formatted value when selected.' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    fallbackStrategies: fallbackOpen({ type: 'click_trigger', triggerSelector: '.flatpickr-calendar, .flatpickr' }),
    documentation:
      'Flatpickr: Renders calendar in a portal or inline. Shadow DOM: possible if embedded in a widget. Risk: staticPosition and appendTo can move DOM; detect in active document and shadow roots. Mobile: may show native or custom overlay.',
  },
  {
    pickerType: 'PIKADAY',
    detection: {
      selectors: ['.pika-single', '.pika-lendar', '[class*="pika"]'],
      classPatterns: ['pika-single', 'pika-lendar'],
      globalCheck: 'Pikaday',
    },
    openStrategy: {
      type: 'focus_then_click',
      triggerSelector: 'input[data-pikaday], .pika-single',
      notes: 'Often bound to input; opening shows .pika-single. May be inline or appended to body.',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.pika-day:not(.is-disabled)',
      inputFormat: 'yyyy-MM-dd',
      notes: 'Click .pika-day. Range not built-in; custom range uses two instances.',
    },
    confirmStrategy: { type: 'none', notes: 'Single click selects and closes.' },
    validateStrategy: { type: 'class_has_selected', selectedDaySelector: '.pika-day.is-selected', notes: 'Selected day has .is-selected.' },
    supportedBaseScenarios: ['DS1', 'DS2', 'DS3', 'DS4', 'DS5', 'DS6'],
    documentation:
      'Pikaday: Lightweight; calendar often appended to body (portal-like). No shadow DOM by default. Iframe: if page is in iframe, picker may render in parent; search parent document roots.',
  },
  {
    pickerType: 'AIR_DATEPICKER',
    detection: {
      selectors: ['.air-datepicker', '.air-datepicker-body', '[data-air-datepicker]'],
      classPatterns: ['air-datepicker'],
      dataAttributes: ['air-datepicker'],
    },
    openStrategy: {
      type: 'focus_input',
      triggerSelector: '.air-datepicker-input, input[data-air-datepicker]',
      fallbackTriggerSelector: '.air-datepicker',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.air-datepicker-cell.-day-:not(.-other-month-)',
      inputFormat: 'yyyy-MM-dd',
      notes: 'Cell classes may vary by version; -day- is typical.',
    },
    confirmStrategy: { type: 'click_apply', buttonSelector: '.air-datepicker-button', notes: 'Optional Apply button; otherwise selection confirms.' },
    validateStrategy: { type: 'input_has_value', inputSelector: 'input[data-air-datepicker]' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    documentation:
      'Air Datepicker: Inline or container; may use container option. Supports range and time. Check container element and document body for dropdown.',
  },
  {
    pickerType: 'JQUERY_UI',
    detection: {
      selectors: ['.ui-datepicker', '#ui-datepicker-div', '.hasDatepicker'],
      classPatterns: ['ui-datepicker', 'hasDatepicker'],
    },
    openStrategy: {
      type: 'focus_input',
      triggerSelector: '.hasDatepicker',
      notes: 'Class added to input. Calendar often in #ui-datepicker-div (body).',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.ui-datepicker-calendar td a',
      inputFormat: 'MM/dd/yyyy',
      notes: 'jQuery UI default format; locale can change.',
    },
    confirmStrategy: { type: 'none', notes: 'Clicking day selects and closes.' },
    validateStrategy: { type: 'input_has_value', inputSelector: '.hasDatepicker' },
    supportedBaseScenarios: ['DS1', 'DS2', 'DS3', 'DS4', 'DS5', 'DS6'],
    documentation:
      'jQuery UI Datepicker: Renders in a div appended to body (portal). If app is in shadow DOM, picker may still be in main document. Search all roots; .hasDatepicker on input is stable.',
  },
  {
    pickerType: 'BOOTSTRAP_UX',
    detection: {
      selectors: ['.datepicker', '.bootstrap-datetimepicker-widget', '.datepicker-dropdown'],
      classPatterns: ['datepicker', 'bootstrap-datetimepicker'],
    },
    openStrategy: {
      type: 'click_trigger',
      triggerSelector: '.datepicker input, input[data-provide="datepicker"]',
      fallbackTriggerSelector: '.input-group-addon, .datepicker',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.datepicker-days tbody td.day:not(.old):not(.new)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none' },
    validateStrategy: { type: 'input_has_value', inputSelector: 'input[data-provide="datepicker"]' },
    supportedBaseScenarios: ['DS1', 'DS2', 'DS3', 'DS4', 'DS5', 'DS6'],
    documentation:
      'Bootstrap Datepicker (uxsolutions): Dropdown or inline; often used with .input-group. Multiple possible class names; prefer data-provide="datepicker" for trigger.',
  },
  {
    pickerType: 'DATERANGEPICKER',
    detection: {
      selectors: ['.daterangepicker', '.drp-calendar', '[class*="daterangepicker"]'],
      classPatterns: ['daterangepicker', 'drp-calendar'],
      globalCheck: 'daterangepicker',
    },
    openStrategy: {
      type: 'click_trigger',
      triggerSelector: 'input[name="daterangepicker"], .daterangepicker-input',
      notes: 'Typically opens on input click/focus. Renders as dropdown (portal).',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.daterangepicker .calendar-table td.available',
      inputSelector: 'input[name="daterangepicker"]',
      endInputSelector: 'input[name="daterangepicker"]',
      inputFormat: 'yyyy-MM-dd',
      notes: 'Range: select start then end day. Or use setStartDate/setEndDate if API exposed.',
    },
    confirmStrategy: { type: 'click_apply', buttonSelector: '.daterangepicker .applyBtn', fallbackButtonSelector: '.applyBtn' },
    validateStrategy: { type: 'input_has_value', inputSelector: 'input[name="daterangepicker"]' },
    supportedBaseScenarios: ['DS1', 'DS2', 'DS3', 'DS6'],
    documentation:
      'DateRangePicker (Dan Grossman): Range-focused; Apply button confirms. Renders outside input (portal). Check document body and roots for .daterangepicker.',
  },
  {
    pickerType: 'LITEPICKER',
    detection: {
      selectors: ['.litepicker', '[data-litepicker]', '.container__main'],
      classPatterns: ['litepicker', 'container__main'],
      dataAttributes: ['litepicker'],
    },
    openStrategy: {
      type: 'focus_input',
      triggerSelector: 'input[data-litepicker], .litepicker-input',
      notes: 'Renders in container or body; mobile may differ.',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.day-item:not(.disabled)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none', notes: 'Range: second click confirms.' },
    validateStrategy: { type: 'input_has_value', inputSelector: 'input[data-litepicker]' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    documentation: 'Litepicker: Lightweight range picker. Inline or dropdown; check container and body.',
  },
  {
    pickerType: 'REACT_DATEPICKER',
    detection: {
      selectors: ['.react-datepicker', '.react-datepicker__month-container', '[class*="react-datepicker"]'],
      classPatterns: ['react-datepicker'],
    },
    openStrategy: {
      type: 'focus_input',
      triggerSelector: '.react-datepicker__input-container input',
      notes: 'Renders in React portal by default (document.body). Search all roots including main document.',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.react-datepicker__day:not(.react-datepicker__day--outside-month)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none' },
    validateStrategy: { type: 'input_has_value', inputSelector: '.react-datepicker__input-container input' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    documentation:
      'React Datepicker: Portals to body by default. With popperContainer, may render in a specific node. Detect in document and any wrapper; avoid relying on inline order.',
  },
  {
    pickerType: 'MUI',
    detection: {
      selectors: ['.MuiPickersPopper-root', '.MuiDialog-root', '[class*="MuiPickers"]', '[class*="MuiDatePicker"]'],
      classPatterns: [/MuiPickers/, /MuiDatePicker/],
      ariaRoles: ['dialog', 'listbox'],
    },
    openStrategy: {
      type: 'focus_input',
      triggerSelector: 'input[aria-label*="date"], .MuiInputBase-input',
      notes: 'MUI X Date Pickers use Popper/modal. Focus input or click to open; calendar in overlay.',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.MuiPickersDay-root:not(.Mui-disabled)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'click_apply', buttonSelector: '.MuiButton-root', notes: 'Desktop: OK button. Mobile: may use different layout.' },
    validateStrategy: { type: 'input_has_value', inputSelector: '.MuiInputBase-input' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    fallbackStrategies: { open: [{ type: 'click_trigger', triggerSelector: '.MuiInputBase-root' }] },
    documentation:
      'MUI DatePicker: Renders in Popper (portal). Mobile vs desktop: different components (CalendarPicker vs CalendarPickerDesktop). ARIA roles and class names are stable.',
  },
  {
    pickerType: 'ANTD',
    detection: {
      selectors: ['.ant-picker', '.ant-picker-dropdown', '[class*="ant-picker"]'],
      classPatterns: ['ant-picker'],
    },
    openStrategy: {
      type: 'focus_input',
      triggerSelector: '.ant-picker-input input',
      fallbackTriggerSelector: '.ant-picker',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.ant-picker-cell-in-view:not(.ant-picker-cell-disabled)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none', notes: 'Ant Design: single click selects. Range: pick start then end.' },
    validateStrategy: { type: 'input_has_value', inputSelector: '.ant-picker-input input' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    documentation:
      'Ant Design DatePicker: Dropdown renders in React portal (getPopupContainer can change). Overlay class: .ant-picker-dropdown. Works in shadow DOM if portal target is inside shadow.',
  },
  {
    pickerType: 'REACT_DAY_PICKER',
    detection: {
      selectors: ['.rdp', '.rdp-day', '[class*="rdp-"]'],
      classPatterns: ['rdp', 'DayPicker'],
    },
    openStrategy: {
      type: 'already_inline',
      notes: 'Often used inline. If in popover, trigger is the wrapper/button that toggles.',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.rdp-day:not(.rdp-day_disabled)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none' },
    validateStrategy: { type: 'aria_selected', selectedDaySelector: '.rdp-day_selected' },
    supportedBaseScenarios: ['DS1', 'DS2', 'DS3', 'DS6'],
    fallbackStrategies: { open: [{ type: 'click_trigger', triggerSelector: '.rdp, [data-rdp]' }] },
    documentation:
      'React Day Picker: Usually inline or inside a custom popover. No single “open” API; detect calendar by .rdp. v8 uses different class names (rdp-*).',
  },
  {
    pickerType: 'ANGULAR_MATERIAL',
    detection: {
      selectors: ['.mat-datepicker-content', '.mat-calendar', '[class*="mat-datepicker"]'],
      classPatterns: ['mat-datepicker', 'mat-calendar'],
      ariaRoles: ['dialog'],
    },
    openStrategy: {
      type: 'focus_input',
      triggerSelector: 'input[matDatepicker], .mat-datepicker-input',
      notes: 'CDK overlay attaches to overlay container (often body). Search document and overlay container.',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.mat-calendar-body-cell:not(.mat-calendar-body-disabled)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none' },
    validateStrategy: { type: 'input_has_value', inputSelector: 'input[matDatepicker]' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    documentation:
      'Angular Material Datepicker: Uses CDK overlay (portal). Overlay container may be outside component tree; detect in document.body and any overlay host.',
  },
  {
    pickerType: 'PRIMENG',
    detection: {
      selectors: ['.p-datepicker', '.p-inputtext[type="text"]', '[class*="p-datepicker"]'],
      classPatterns: ['p-datepicker', 'p-datepicker-calendar'],
    },
    openStrategy: {
      type: 'click_trigger',
      triggerSelector: '.p-datepicker-input, input.p-inputtext',
      fallbackTriggerSelector: '.p-datepicker-inline',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.p-datepicker-calendar td span:not(.p-disabled)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none' },
    validateStrategy: { type: 'input_has_value', inputSelector: '.p-datepicker-input' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    documentation: 'PrimeNG DatePicker: Overlay or inline. Panel has .p-datepicker; trigger has .p-datepicker-input.',
  },
  {
    pickerType: 'KENDO',
    detection: {
      selectors: ['.k-datepicker', '.k-calendar', '[class*="k-datepicker"]'],
      classPatterns: ['k-datepicker', 'k-calendar'],
    },
    openStrategy: {
      type: 'click_trigger',
      triggerSelector: '.k-datepicker .k-input',
      fallbackTriggerSelector: '.k-datepicker .k-dateinput',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.k-calendar-md .k-link:not(.k-state-disabled)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none' },
    validateStrategy: { type: 'input_has_value', inputSelector: '.k-datepicker .k-input' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    documentation: 'Kendo UI Datepicker: Renders in popup. Class names may include theme prefix (e.g. kendo-).',
  },
  {
    pickerType: 'SYNCFUSION',
    detection: {
      selectors: ['.e-datepicker', '.e-calendar', '[class*="e-datepicker"]'],
      classPatterns: ['e-datepicker', 'e-calendar'],
    },
    openStrategy: {
      type: 'click_trigger',
      triggerSelector: '.e-datepicker .e-input',
      fallbackTriggerSelector: '.e-date-wrapper',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.e-calendar .e-day:not(.e-disabled)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none' },
    validateStrategy: { type: 'input_has_value', inputSelector: '.e-datepicker .e-input' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    documentation: 'Syncfusion DatePicker: Popup calendar. Prefix "e-" for controls. May render in overlay container.',
  },
  {
    pickerType: 'DEVEXPRESS',
    detection: {
      selectors: ['.dx-datebox', '.dx-calendar', '[class*="dx-datebox"]'],
      classPatterns: ['dx-datebox', 'dx-calendar'],
    },
    openStrategy: {
      type: 'click_trigger',
      triggerSelector: '.dx-datebox .dx-texteditor-input',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.dx-calendar .dx-calendar-cell:not(.dx-state-disabled)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none' },
    validateStrategy: { type: 'input_has_value', inputSelector: '.dx-datebox .dx-texteditor-input' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    documentation: 'DevExpress Date Editor: Renders in overlay. Class prefix "dx-". Supports range and different modes.',
  },
  {
    pickerType: 'CLARITY',
    detection: {
      selectors: ['.clr-datepicker', '.datepicker', '[class*="clr-date"]'],
      classPatterns: ['clr-date', 'clr-datepicker'],
    },
    openStrategy: {
      type: 'click_trigger',
      triggerSelector: '.clr-input, input.clr-date-input',
      fallbackTriggerSelector: '.datepicker-trigger',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.day',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none' },
    validateStrategy: { type: 'input_has_value', inputSelector: '.clr-input' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    documentation: 'Clarity Datepicker (VMware): Inline or popover. Class prefix "clr-". Check clarity design tokens.',
  },
  {
    pickerType: 'SEMANTIC_UI',
    detection: {
      selectors: ['.ui.calendar', '.ui.calendar .table', '[class*="ui calendar"]'],
      classPatterns: ['ui calendar', 'ui-calendar'],
    },
    openStrategy: {
      type: 'click_trigger',
      triggerSelector: '.ui.calendar input',
      fallbackTriggerSelector: '.ui.calendar',
    },
    setDateStrategy: {
      type: 'click_day',
      daySelector: '.ui.calendar .calendar td.link:not(.disabled)',
      inputFormat: 'yyyy-MM-dd',
    },
    confirmStrategy: { type: 'none' },
    validateStrategy: { type: 'input_has_value', inputSelector: '.ui.calendar input' },
    supportedBaseScenarios: ALL_BASE_SCENARIOS,
    documentation: 'Semantic UI Calendar: Uses custom or third-party calendar. Classes: .ui.calendar; table for grid.',
  },
  {
    pickerType: 'IONIC',
    detection: {
      selectors: ['.ion-datetime', 'ion-datetime', 'ion-modal [class*="datetime"]'],
      classPatterns: ['ion-datetime', 'datetime'],
    },
    openStrategy: {
      type: 'click_trigger',
      triggerSelector: 'ion-datetime, input[type="text"]',
      notes: 'Ionic DateTime: often used as modal or inline. Custom element; search for ion-datetime.',
    },
    setDateStrategy: {
      type: 'api_setDate',
      inputFormat: 'yyyy-MM-dd',
      apiMethod: 'value',
      notes: 'Ionic uses value property; may need to set and confirm in modal.',
    },
    confirmStrategy: { type: 'click_done', buttonSelector: 'ion-datetime .datetime-ready-btn, ion-modal ion-button' },
    validateStrategy: { type: 'api_value', notes: 'Check ion-datetime value property.' },
    supportedBaseScenarios: ['DS1', 'DS2', 'DS3', 'DS4', 'DS5', 'DS6'],
    documentation:
      'Ionic DateTime Picker: Renders in ion-modal or inline. Shadow DOM inside ion-datetime; use getSearchableRoots and query within host. Mobile: wheel picker.',
  },
]
