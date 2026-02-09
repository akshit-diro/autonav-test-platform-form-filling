import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { UX_DELAYS } from '../../config/uxDelays'
import { getLastUsername, setLastUsername } from '../../utils/stateLeakage'
import { delay } from '../../utils/delay'
import { DomNoise, DomNoiseDecorativeIcon } from '../../components/DomNoise'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, postLoginOtpRequired, verifyOtp, authFlowVariant } = useAuth()
  const [username, setUsername] = useState(() => getLastUsername() ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null)
  const [otpInput, setOtpInput] = useState('')

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
    </div>
  )
}
