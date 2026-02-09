import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { getDefaultRedirectForUser } from '../../auth/routing'
import { DashboardLayout } from '../../components/DashboardLayout'
import { DomNoiseDecorativeIcon } from '../../components/DomNoise'

const FAKE_ACCOUNTS = [
  { id: '1', type: 'Current', last4: '4521', balance: '£12,450.00' },
  { id: '2', type: 'Savings', last4: '7832', balance: '£8,200.00' },
  { id: '3', type: 'Current', last4: '9012', balance: '£2,100.00' },
] as const

const FAKE_ACTIVITY = [
  { id: 'a1', description: 'Direct debit – Utilities', amount: '-£85.00', date: 'Today' },
  { id: 'a2', description: 'Transfer from savings', amount: '+£500.00', date: 'Yesterday' },
  { id: 'a3', description: 'Card payment – Supermarket', amount: '-£42.30', date: 'Yesterday' },
  { id: 'a4', description: 'Salary credit', amount: '+£3,200.00', date: '2 days ago' },
] as const

export function HomePage() {
  const { user } = useAuth()

  return (
    <DashboardLayout contentClassName="page--dashboard">
      <header className="dashboard-header">
        <h1>Accounts</h1>
        {user && (
          <p className="dashboard-header__user">
            Welcome back, <strong>{user}</strong>.
          </p>
        )}
      </header>

      <section className="account-cards" aria-label="Account summary" data-testid="account-cards">
        {FAKE_ACCOUNTS.map((acc) => (
          <article
            key={acc.id}
            className="account-card"
            data-testid="account-card"
          >
            <div className="account-card__type">{acc.type}</div>
            <div className="account-card__number">•••• {acc.last4}</div>
            <div className="account-card__balance">{acc.balance}</div>
          </article>
        ))}
      </section>

      <section className="dashboard-cta" data-testid="dashboard-cta-statements">
        <Link
          to={getDefaultRedirectForUser(user ?? null)}
          className="dashboard-cta__button"
          data-testid="link-to-statements"
        >
          <DomNoiseDecorativeIcon type="download" />
          Download statements
        </Link>
      </section>

      <section
        className="recent-activity"
        aria-label="Recent activity"
        data-testid="recent-activity"
      >
        <h2>Recent activity</h2>
        <ul className="recent-activity__list">
          {FAKE_ACTIVITY.map((item) => (
            <li key={item.id} className="recent-activity__item" data-testid="recent-activity-item">
              <span className="recent-activity__desc">{item.description}</span>
              <span className="recent-activity__amount">{item.amount}</span>
              <span className="recent-activity__date">{item.date}</span>
            </li>
          ))}
        </ul>
      </section>
    </DashboardLayout>
  )
}
