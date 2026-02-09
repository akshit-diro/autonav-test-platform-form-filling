import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { UX_DELAYS } from '../../config/uxDelays'
import { delay } from '../../utils/delay'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const result = login(username.trim(), password)
    if (result.success && result.defaultRedirect) {
      await delay(UX_DELAYS.DELAY_BEFORE_NAVIGATE_AFTER_LOGIN_MS)
      navigate(result.defaultRedirect, { replace: true })
    } else {
      setError('Invalid username or password.')
    }
  }

  return (
    <div className="page page--login">
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
        <button type="submit" data-testid="sign-in">Sign in</button>
      </form>
    </div>
  )
}
