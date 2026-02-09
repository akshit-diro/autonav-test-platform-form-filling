import { ReactNode } from 'react'
import { getBankThemeConfig } from '../config/bankThemes'
import { DashboardNav } from './DashboardNav'
import { DomNoise } from './DomNoise'

interface DashboardLayoutProps {
  children: ReactNode
  /** Optional extra class names for the page content wrapper (e.g. page--dashboard, page--statements). */
  contentClassName?: string
}

/**
 * Theme-aware dashboard layout: top-nav (bank_a) or sidebar (bank_b).
 * Renders nav + content with theme-specific DOM structure and class names.
 */
export function DashboardLayout({ children, contentClassName }: DashboardLayoutProps) {
  const theme = getBankThemeConfig()
  const shellClass = theme.shellWrapperClasses.join(' ')
  const navWrapperClass = theme.navWrapperClasses.join(' ')
  const contentClass = [theme.contentWrapperClasses.join(' '), contentClassName]
    .filter(Boolean)
    .join(' ')

  if (theme.layout === 'sidebar') {
    return (
      <div className={shellClass} data-testid="dashboard-layout">
        <aside className={navWrapperClass} aria-label="Main navigation">
          <DashboardNav />
        </aside>
        <main className={contentClass}>
          <DomNoise placement="dashboard" />
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className={shellClass} data-testid="dashboard-layout">
      <DashboardNav />
      <main className={contentClass}>
        <DomNoise placement="dashboard" />
        {children}
      </main>
    </div>
  )
}
