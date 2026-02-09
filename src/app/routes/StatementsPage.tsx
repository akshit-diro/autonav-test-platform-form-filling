import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { scenarioMatrix } from '../../config/scenarioMatrix'
import { DashboardNav } from '../../components/DashboardNav'

export function StatementsPage() {
  const { allowedScenarios } = useAuth()
  const entries = Object.entries(scenarioMatrix).filter(([id]) => allowedScenarios.includes(id))

  return (
    <div className="page page--dashboard page--statements">
      <DashboardNav />
      <h1>Statement download</h1>
      <p className="page__description">
        Choose a statement type and date range. You will be able to download a PDF.
      </p>
      <section aria-label="Statement types" data-testid="statement-types">
        <ul className="statement-type-list">
          {entries.map(([id, { route, displayName, description }]) => (
            <li key={id}>
              <Link
                to={route}
                className="statement-type-card"
                data-testid={`statement-type-${id}`}
              >
                <span className="statement-type-card__title">{displayName}</span>
                <span className="statement-type-card__desc">{description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
