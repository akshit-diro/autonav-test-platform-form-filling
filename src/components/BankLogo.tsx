/**
 * Bank logo: inline SVG icon + optional wordmark.
 * Used on login page and in the navigation bar.
 */

interface BankLogoProps {
  /** Size in pixels (height; width scales). Default 40 for nav, use larger for login. */
  size?: number
  /** Extra class name for the wrapper. */
  className?: string
  /** When true, show "Bank" wordmark next to the icon. */
  showWordmark?: boolean
}

export function BankLogo({ size = 40, className = '', showWordmark = false }: BankLogoProps) {
  return (
    <div
      className={`bank-logo ${className}`.trim()}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      data-testid="bank-logo"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={!showWordmark}
        role={showWordmark ? 'img' : undefined}
        aria-label={showWordmark ? 'Bank logo' : undefined}
      >
        <path
          d="M4 28V12l12-8 12 8v16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 4v24M4 16h24M4 20h24M4 24h24"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span className="bank-logo__wordmark" style={{ fontWeight: 600, fontSize: '1.125rem', color: 'inherit' }}>
          Bank
        </span>
      )}
    </div>
  )
}
