/**
 * DOM noise level helpers. Noise is deterministic for a given level.
 * Used by DomNoise component and decorative icon injection.
 */
import type { DomNoiseLevel } from './appConfig'
import { appConfig } from './appConfig'

export type { DomNoiseLevel } from './appConfig'

/** Current DOM noise level from app config. */
export function getDomNoiseLevel(): DomNoiseLevel {
  return appConfig.domNoiseLevel
}

/** True if decorative icons should be rendered inside primary buttons/links. */
export function shouldShowDecorativeIcons(): boolean {
  return appConfig.domNoiseLevel === 'high'
}
