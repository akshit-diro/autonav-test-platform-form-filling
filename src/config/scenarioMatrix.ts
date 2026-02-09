/**
 * Scenario id → route, display name, description.
 * Single source of truth for scenario-based routes.
 * Base scenarios (DS1–DS6) plus picker-specific variants (DS<n>-<PICKER>).
 */

export interface ScenarioMetadata {
  /** Base scenario id (DS1–DS6). */
  baseScenario: string
  /** Picker type/library (variants only). */
  pickerType?: string
}

export interface ScenarioAuth {
  type: 'credential' | 'anonymous'
  /** When type is credential, username for test login (optional; may use scenario id). */
  username?: string
}

export interface ScenarioEntry {
  scenarioId: string
  route: string
  displayName: string
  description: string
  /** Auth requirement. Omitted for base scenarios (use credentials as today). */
  auth?: ScenarioAuth
  /** Optional metadata (baseScenario for all; pickerType for variants). */
  metadata?: ScenarioMetadata
}

const STATEMENTS_PREFIX = '/statements'

/** Base scenario ids in DS1–DS6 order. Do not modify. */
const BASE_SCENARIO_IDS = [
  'presets',
  'from-to',
  'dual-calendar',
  'month-year',
  'year-only',
  'inline-calendar',
] as const

/** Base scenario slug → DS id (e.g. presets → DS1). */
const BASE_SLUG_TO_DS: Record<string, string> = Object.fromEntries(
  BASE_SCENARIO_IDS.map((slug, i) => [slug, `DS${i + 1}`])
)

export const scenarioMatrix: Record<string, Omit<ScenarioEntry, 'scenarioId'>> = {
  presets: {
    route: `${STATEMENTS_PREFIX}/presets`,
    displayName: 'Presets',
    description: 'Date picker with preset ranges (e.g. Last 7 days, This month).',
  },
  'from-to': {
    route: `${STATEMENTS_PREFIX}/from-to`,
    displayName: 'From–To',
    description: 'Start and end date selection with linked validation.',
  },
  'dual-calendar': {
    route: `${STATEMENTS_PREFIX}/dual-calendar`,
    displayName: 'Dual calendar',
    description: 'Two calendars side by side for range selection.',
  },
  'month-year': {
    route: `${STATEMENTS_PREFIX}/month-year`,
    displayName: 'Month & year',
    description: 'Month and year dropdowns only (no day picker).',
  },
  'year-only': {
    route: `${STATEMENTS_PREFIX}/year-only`,
    displayName: 'Year only',
    description: 'Single year selector.',
  },
  'inline-calendar': {
    route: `${STATEMENTS_PREFIX}/inline-calendar`,
    displayName: 'Inline calendar',
    description: 'Calendar always visible inline (no popover).',
  },
}

/** Picker registry: code (for scenario id), display name, URL route slug. */
export const PICKER_REGISTRY: ReadonlyArray<{ code: string; displayName: string; routeSlug: string }> = [
  { code: 'FLATPICKR', displayName: 'Flatpickr', routeSlug: 'flatpickr' },
  { code: 'PIKADAY', displayName: 'Pikaday', routeSlug: 'pikaday' },
  { code: 'AIR_DATEPICKER', displayName: 'Air Datepicker', routeSlug: 'air-datepicker' },
  { code: 'JQUERY_UI', displayName: 'jQuery UI Datepicker', routeSlug: 'jquery-ui-datepicker' },
  { code: 'BOOTSTRAP_UX', displayName: 'Bootstrap Datepicker (uxsolutions)', routeSlug: 'bootstrap-datepicker' },
  { code: 'DATERANGEPICKER', displayName: 'DateRangePicker (Dan Grossman)', routeSlug: 'daterangepicker' },
  { code: 'LITEPICKER', displayName: 'Litepicker', routeSlug: 'litepicker' },
  { code: 'REACT_DATEPICKER', displayName: 'React Datepicker', routeSlug: 'react-datepicker' },
  { code: 'MUI', displayName: 'MUI DatePicker', routeSlug: 'mui-datepicker' },
  { code: 'ANTD', displayName: 'Ant Design DatePicker', routeSlug: 'antd-datepicker' },
  { code: 'REACT_DAY_PICKER', displayName: 'React Day Picker', routeSlug: 'react-day-picker' },
  { code: 'ANGULAR_MATERIAL', displayName: 'Angular Material Datepicker', routeSlug: 'angular-material-datepicker' },
  { code: 'PRIMENG', displayName: 'PrimeNG DatePicker', routeSlug: 'primeng-datepicker' },
  { code: 'KENDO', displayName: 'Kendo UI Datepicker', routeSlug: 'kendo-datepicker' },
  { code: 'SYNCFUSION', displayName: 'Syncfusion DatePicker', routeSlug: 'syncfusion-datepicker' },
  { code: 'DEVEXPRESS', displayName: 'DevExpress Date Editor', routeSlug: 'devexpress-date-editor' },
  { code: 'CARBON', displayName: 'Carbon Design DatePicker (IBM)', routeSlug: 'carbon-datepicker' },
  { code: 'CLARITY', displayName: 'Clarity Datepicker (VMware)', routeSlug: 'clarity-datepicker' },
  { code: 'SEMANTIC_UI', displayName: 'Semantic UI Calendar', routeSlug: 'semantic-ui-calendar' },
  { code: 'MOBISCROLL', displayName: 'Mobiscroll Date Picker', routeSlug: 'mobiscroll-datepicker' },
  { code: 'IONIC', displayName: 'Ionic DateTime Picker', routeSlug: 'ionic-datetime-picker' },
]

/** Route slug → picker code (for resolving /statements/:picker/:baseScenario). */
const PICKER_SLUG_TO_CODE: Record<string, string> = Object.fromEntries(
  PICKER_REGISTRY.map((p) => [p.routeSlug, p.code])
)

/** Generated picker-variant scenarios: DS<n>-<PICKER>. Not added to scenarioMatrix to keep base matrix unchanged. */
function buildScenarioVariants(): Record<string, Omit<ScenarioEntry, 'scenarioId'>> {
  const variants: Record<string, Omit<ScenarioEntry, 'scenarioId'>> = {}
  const baseEntries = scenarioMatrix as Record<string, { displayName: string }>

  BASE_SCENARIO_IDS.forEach((baseSlug, index) => {
    const baseDs = `DS${index + 1}`
    const baseDisplayName = baseEntries[baseSlug]?.displayName ?? baseSlug

    PICKER_REGISTRY.forEach((picker) => {
      const scenarioId = `${baseDs}-${picker.code}`
      variants[scenarioId] = {
        route: `${STATEMENTS_PREFIX}/${picker.routeSlug}/${baseSlug}`,
        displayName: `${baseDisplayName} (${picker.displayName})`,
        description: `Picker variant: ${picker.displayName} on base ${baseDs}.`,
        auth: { type: 'credential' },
        metadata: {
          baseScenario: baseDs,
          pickerType: picker.code,
        },
      }
    })
  })

  return variants
}

export const scenarioVariantMatrix = buildScenarioVariants()

/** All base scenario ids in matrix order (DS1–DS6). Unchanged. */
export const scenarioIds = Object.keys(scenarioMatrix) as string[]

/** All scenario ids: base first, then variants (DS1-FLATPICKR, etc.). */
export const allScenarioIds: string[] = [
  ...scenarioIds,
  ...Object.keys(scenarioVariantMatrix),
]

/** Get full scenario entry by id (base or variant), or undefined if invalid. */
export function getScenario(scenarioId: string): ScenarioEntry | undefined {
  const base = scenarioMatrix[scenarioId]
  if (base) return { scenarioId, ...base }
  const variant = scenarioVariantMatrix[scenarioId]
  if (variant) return { scenarioId, ...variant }
  return undefined
}

/** Resolve variant scenario id from route params /statements/:picker/:baseScenario. */
export function getScenarioIdFromRoute(pickerSlug: string, baseScenarioSlug: string): string | undefined {
  const baseDs = BASE_SLUG_TO_DS[baseScenarioSlug]
  const pickerCode = PICKER_SLUG_TO_CODE[pickerSlug]
  if (!baseDs || !pickerCode) return undefined
  const scenarioId = `${baseDs}-${pickerCode}`
  return scenarioVariantMatrix[scenarioId] ? scenarioId : undefined
}
