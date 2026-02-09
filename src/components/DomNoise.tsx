import { appConfig } from '../config/appConfig'

type Placement = 'login' | 'dashboard' | 'statement'

const level = (): 'none' | 'low' | 'medium' | 'high' => appConfig.domNoiseLevel

/** Visually hidden but present in DOM (increases complexity, never blocks). */
const hiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

interface DomNoiseProps {
  placement: Placement
}

/**
 * Renders deterministic DOM noise for the given placement.
 * Noise level is read from VITE_DOM_NOISE_LEVEL. Never blocks the happy path.
 */
export function DomNoise({ placement }: DomNoiseProps) {
  const lvl = level()
  if (lvl === 'none') return null

  const elements: React.ReactNode[] = []

  // --- Low: hidden button + duplicate label (deterministic per placement) ---
  const dupLabelLow = { login: 'Username', dashboard: 'Account', statement: 'Date range' }[placement]
  if (lvl >= 'low') {
    elements.push(
      <button
        key="noise-btn-hidden"
        type="button"
        className="dom-noise dom-noise--hidden"
        style={hiddenStyle}
        tabIndex={-1}
        aria-hidden
        data-dom-noise
        data-testid="dom-noise-hidden-button"
      >
        Skip to content
      </button>
    )
    elements.push(
      <label key="noise-dup-label-1" htmlFor="dom-noise-fake-1" className="dom-noise dom-noise--hidden" style={hiddenStyle} aria-hidden data-dom-noise>
        {dupLabelLow}
      </label>
    )
  }

  // --- Medium: disabled input + non-functional dropdown ---
  if (lvl >= 'medium') {
    elements.push(
      <div key="noise-disabled-input" className="dom-noise dom-noise--disabled-input" data-dom-noise style={{ marginBottom: '0.5rem' }}>
        <label htmlFor="dom-noise-account">Account reference</label>
        <input
          id="dom-noise-account"
          type="text"
          disabled
          readOnly
          value=""
          aria-hidden
          data-testid="dom-noise-disabled-input"
          style={{ maxWidth: '10rem' }}
        />
      </div>
    )
    elements.push(
      <div key="noise-dropdown" className="dom-noise dom-noise--dropdown" data-dom-noise style={{ marginBottom: '0.5rem' }}>
        <label htmlFor="dom-noise-lang">Language</label>
        <select id="dom-noise-lang" disabled aria-hidden data-testid="dom-noise-dropdown" style={{ maxWidth: '10rem' }}>
          <option value="">—</option>
        </select>
      </div>
    )
    elements.push(
      <label key="noise-dup-label-2" htmlFor="dom-noise-fake-2" className="dom-noise dom-noise--hidden" style={hiddenStyle} aria-hidden data-dom-noise>
        {placement === 'login' ? 'Password' : 'Reference'}
      </label>
    )
  }

  // --- High: extra hidden button + duplicate label (deterministic) ---
  if (lvl === 'high') {
    elements.push(
      <button
        key="noise-btn-hidden-2"
        type="button"
        className="dom-noise dom-noise--hidden"
        style={hiddenStyle}
        tabIndex={-1}
        aria-hidden
        data-dom-noise
      >
        Print page
      </button>
    )
    elements.push(
      <label key="noise-dup-label-3" htmlFor="dom-noise-fake-3" className="dom-noise dom-noise--hidden" style={hiddenStyle} aria-hidden data-dom-noise>
        Help
      </label>
    )
  }

  if (elements.length === 0) return null

  return (
    <div className="dom-noise-container" data-dom-noise-placement={placement} data-testid="dom-noise">
      {elements}
    </div>
  )
}

/** Decorative icon to render inside primary buttons when noise level is high. Does not block clicks. */
export function DomNoiseDecorativeIcon({ type }: { type: 'submit' | 'download' }) {
  if (appConfig.domNoiseLevel !== 'high') return null
  const char = type === 'submit' ? '🔒' : '📄'
  return (
    <span className="dom-noise-icon" aria-hidden data-dom-noise>
      {char}
    </span>
  )
}
