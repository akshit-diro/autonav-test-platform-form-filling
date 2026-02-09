/**
 * Bank theme definitions. Structure, class names, and copy vary by theme.
 * Controlled by VITE_BANK_THEME; default is bank_a.
 */

import { appConfig } from './appConfig'

export type BankThemeId = 'bank_a' | 'bank_b'

export interface BankThemeConfig {
  /** Layout variant: top navigation bar vs sidebar. */
  layout: 'top-nav' | 'sidebar'
  /** Root wrapper class names (app-level). */
  rootWrapperClasses: string[]
  /** Wrapper around nav + content (theme-specific depth/names). */
  shellWrapperClasses: string[]
  /** Wrapper that contains only the nav. */
  navWrapperClasses: string[]
  /** Wrapper that contains main page content. */
  contentWrapperClasses: string[]
  /** Label for the statement/download PDF button. */
  downloadButtonLabel: string
}

const THEMES: Record<BankThemeId, BankThemeConfig> = {
  bank_a: {
    layout: 'top-nav',
    rootWrapperClasses: ['bank-app'],
    shellWrapperClasses: ['bank-app__main'],
    navWrapperClasses: ['dashboard-nav'],
    contentWrapperClasses: ['page'],
    downloadButtonLabel: 'Download PDF',
  },
  bank_b: {
    layout: 'sidebar',
    rootWrapperClasses: ['bank-app', 'bank-app--theme-b'],
    shellWrapperClasses: ['bank-app__shell'],
    navWrapperClasses: ['bank-app__sidebar', 'sidebar-nav'],
    contentWrapperClasses: ['bank-app__content', 'page'],
    downloadButtonLabel: 'Get Statement',
  },
}

/** Current theme id from app config. */
export function getBankThemeId(): BankThemeId {
  return appConfig.bankTheme
}

/** Config for the active bank theme. */
export function getBankThemeConfig(): BankThemeConfig {
  return THEMES[appConfig.bankTheme]
}
