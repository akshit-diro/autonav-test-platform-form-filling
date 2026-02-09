import { useAuth } from '../../auth/useAuth'
import { DashboardNav } from '../../components/DashboardNav'

export function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div className="page page--dashboard page--profile">
      <DashboardNav />
      <h1>Profile</h1>
      <p className="page__description">
        Manage your account details and preferences.
      </p>
      <section className="profile-placeholder" data-testid="profile-content">
        <p>
          Logged in as <strong>{user ?? '—'}</strong>.
        </p>
        <button type="button" onClick={logout} data-testid="profile-logout">
          Log out
        </button>
      </section>
    </div>
  )
}
