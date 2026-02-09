import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { credentials } from '../../auth/credentials'
import type { CredentialEntry } from '../../auth/credentials'
import { scenarioMatrix, scenarioIds } from '../../config/scenarioMatrix'
import { UX_DELAYS } from '../../config/uxDelays'
import { getLastUsername, setLastUsername } from '../../utils/stateLeakage'
import { delay } from '../../utils/delay'
import { DomNoise, DomNoiseDecorativeIcon } from '../../components/DomNoise'

const ADMIN_VIEWER_TESTER = ['admin', 'viewer', 'tester'] as const

function getAccessNote(entry: CredentialEntry): string {
  if (entry.scenarioAgnostic) {
    const count = entry.allowedScenarios.filter((s) => s !== 'admin').length
    return `Scenario-agnostic; Statements → picker (${count} scenarios)`
  }
  return `Scenario-bound → ${entry.defaultScenario} only`
}

const adminViewerTesterList = ADMIN_VIEWER_TESTER.filter((u) => credentials[u]).map((username) => {
  const entry = credentials[username]
  return {
    username,
    password: entry.password,
    accessNote: getAccessNote(entry),
  }
})

const scenarioList = scenarioIds.map((scenarioId) => {
  const entry = scenarioMatrix[scenarioId]
  const cred = credentials[scenarioId]
  return {
    testScenarioId: scenarioId,
    displayName: entry.displayName,
    username: cred?.password != null ? scenarioId : '—',
    password: cred?.password ?? '—',
    route: entry.route,
  }
})

export function LoginPage() {
  const navigate = useNavigate()
  const { login, postLoginOtpRequired, verifyOtp, authFlowVariant } = useAuth()
  const [username, setUsername] = useState(() => getLastUsername() ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null)
  const [otpInput, setOtpInput] = useState('')
  const [credentialsOpen, setCredentialsOpen] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const result = login(username.trim(), password)
    if (result.success && result.defaultRedirect) {
      setLastUsername(username.trim())
      if (authFlowVariant === 'otp-simulated') {
        setPendingRedirect(result.defaultRedirect)
        return
      }
      await delay(UX_DELAYS.DELAY_BEFORE_NAVIGATE_AFTER_LOGIN_MS)
      navigate(result.defaultRedirect, { replace: true })
    } else {
      setError('Invalid username or password.')
    }
  }

  async function handleOtpVerify(e: FormEvent) {
    e.preventDefault()
    if (!pendingRedirect) return
    verifyOtp()
    await delay(UX_DELAYS.DELAY_BEFORE_NAVIGATE_AFTER_LOGIN_MS)
    navigate(pendingRedirect, { replace: true })
  }

  if (postLoginOtpRequired) {
    return (
      <div className="page page--login">
        <DomNoise placement="login" />
        <h1>Verify with code</h1>
        <p>Enter the code sent to your device.</p>
        <form onSubmit={handleOtpVerify}>
          <div>
            <label htmlFor="otp-code">Verification code</label>
            <input
              id="otp-code"
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              data-testid="otp-input"
            />
          </div>
          <button type="submit" data-testid="otp-verify">
            Verify
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="page page--login">
      <DomNoise placement="login" />
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            data-testid="username"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            data-testid="password"
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" data-testid="sign-in">
          <DomNoiseDecorativeIcon type="submit" />
          Sign in
        </button>
      </form>

      <button
        type="button"
        className="login-credentials-toggle"
        onClick={() => setCredentialsOpen((o) => !o)}
        aria-expanded={credentialsOpen}
        aria-controls="login-credentials-sidebar"
        data-testid="credentials-toggle"
      >
        {credentialsOpen ? 'Hide test credentials' : 'Show test credentials'}
      </button>

      {credentialsOpen && (
        <div
          className="login-credentials-backdrop"
          aria-hidden
          onClick={() => setCredentialsOpen(false)}
          data-testid="credentials-backdrop"
        />
      )}

      <aside
        id="login-credentials-sidebar"
        className={`login-credentials-sidebar ${credentialsOpen ? 'login-credentials-sidebar--open' : ''}`}
        aria-label="Test credentials"
        data-testid="credentials-table"
      >
        <div className="login-credentials-sidebar__inner">
          <div className="login-credentials-sidebar__header">
            <h2 className="login-credentials-sidebar__title">Test credentials</h2>
            <button
              type="button"
              className="login-credentials-sidebar__close"
              onClick={() => setCredentialsOpen(false)}
              aria-label="Close"
              data-testid="credentials-close"
            >
              ×
            </button>
          </div>
          <p className="login-credentials-sidebar__hint">
            Use any row to sign in. Post-login: Accounts. Statements behaviour depends on access type.
          </p>
          <div className="login-credentials-sidebar__table-wrap">
            <section className="login-credentials-section" aria-labelledby="credentials-admin-viewer-tester">
              <h3 id="credentials-admin-viewer-tester" className="login-credentials-section__title">Admin / Viewer / Tester</h3>
              <table className="login-credentials-table__table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Access type</th>
                  </tr>
                </thead>
                <tbody>
                  {adminViewerTesterList.map(({ username: u, password: p, accessNote }) => (
                    <tr key={u} data-testid={`credentials-row-${u}`}>
                      <td data-testid="cred-username">{u}</td>
                      <td data-testid="cred-password">{p}</td>
                      <td data-testid="cred-access">{accessNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="login-credentials-section" aria-labelledby="credentials-scenarios">
              <h3 id="credentials-scenarios" className="login-credentials-section__title">Scenarios</h3>
              <table className="login-credentials-table__table">
                <thead>
                  <tr>
                    <th>Test scenario ID</th>
                    <th>Display name</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Route</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioList.map(({ testScenarioId, displayName, username: u, password: p, route }) => (
                    <tr key={testScenarioId} data-testid={`credentials-scenario-row-${testScenarioId}`}>
                      <td data-testid="cred-test-scenario-id">{testScenarioId}</td>
                      <td data-testid="cred-scenario-display-name">{displayName}</td>
                      <td data-testid="cred-scenario-username">{u}</td>
                      <td data-testid="cred-scenario-password">{p}</td>
                      <td data-testid="cred-scenario-route">{route}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </aside>
    </div>
  )
}
