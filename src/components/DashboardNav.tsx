import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getStatementsNavigationPath } from '../auth/routing'

export function DashboardNav() {
  const { user } = useAuth()
  const statementsTo = getStatementsNavigationPath(user ?? null)

  const items = [
    { to: '/', label: 'Accounts', end: true },
    { to: statementsTo, label: 'Statements', end: false },
    { to: '/profile', label: 'Profile', end: true },
  ] as const

  return (
    <nav className="dashboard-nav" aria-label="Main" data-testid="dashboard-nav">
      <ul className="dashboard-nav__list">
        {items.map(({ to, label, end }) => (
          <li key={label}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                'dashboard-nav__link' + (isActive ? ' dashboard-nav__link--active' : '')
              }
              data-testid={`nav-${label.toLowerCase()}`}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
