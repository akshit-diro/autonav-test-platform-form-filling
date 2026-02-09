/**
 * Date picker container strategy: normal DOM, shadow root, or iframe.
 * Used only in selected scenarios (Presets, From-To, Dual Calendar, Inline Calendar).
 */
import { appConfig } from './appConfig'

export type PickerContainerStrategy = 'normal' | 'shadow' | 'iframe'

/** If both flags are true, iframe takes precedence. */
export function getPickerContainerStrategy(): PickerContainerStrategy {
  if (appConfig.useIframePicker) return 'iframe'
  if (appConfig.useShadowDom) return 'shadow'
  return 'normal'
}
