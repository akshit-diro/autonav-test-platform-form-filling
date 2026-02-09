import { FormEvent, useState } from 'react'

export interface ReauthModalProps {
  open: boolean
  onConfirm: (password: string) => boolean
  onCancel: () => void
}

/**
 * Modal that prompts for password to re-authenticate before a sensitive action (e.g. PDF download).
 * Simulated: no backend; onConfirm validates against current user's password and returns true/false.
 */
export function ReauthModal({ open, onConfirm, onCancel }: ReauthModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const ok = onConfirm(password)
    if (ok) {
      setPassword('')
      return
    }
    setError('Incorrect password. Try again.')
  }

  function handleCancel() {
    setPassword('')
    setError(null)
    onCancel()
  }

  return (
    <div
      className="reauth-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reauth-modal-title"
      data-testid="reauth-modal"
    >
      <div className="reauth-modal">
        <h2 id="reauth-modal-title">Confirm your identity</h2>
        <p>Re-enter your password to continue.</p>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reauth-password">Password</label>
            <input
              id="reauth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              data-testid="reauth-password"
            />
          </div>
          {error && <p role="alert" className="form-error">{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="submit" data-testid="reauth-confirm">
              Confirm
            </button>
            <button type="button" onClick={handleCancel} data-testid="reauth-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
