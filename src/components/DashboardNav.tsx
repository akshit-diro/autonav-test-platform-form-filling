import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Accounts', end: true },
  { to: '/statements', label: 'Statements', end: true },
  { to: '/profile', label: 'Profile', end: true },
] as const

export function DashboardNav() {
  return (
    <nav className="dashboard-nav" aria-label="Main" data-testid="dashboard-nav">
      <ul className="dashboard-nav__list">
        {items.map(({ to, label, end }) => (
          <li key={to}>
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
