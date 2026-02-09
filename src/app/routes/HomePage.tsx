import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { scenarioMatrix } from '../../config/scenarioMatrix'

export function HomePage() {
  const { user, logout, allowedScenarios } = useAuth()
  const allowedScenarioEntries = Object.entries(scenarioMatrix).filter(([id]) =>
    allowedScenarios.includes(id)
  )

  return (
    <div>
      <h1>Home</h1>
      {user && (
        <p>
          Logged in as <strong>{user}</strong>.{' '}
          <button type="button" onClick={logout}>
            Log out
          </button>
        </p>
      )}
      {allowedScenarioEntries.length > 0 && (
        <nav>
          <h2>Scenarios</h2>
          <ul>
            {allowedScenarioEntries.map(([id, { route, displayName }]) => (
              <li key={id}>
                <Link to={route}>{displayName}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
