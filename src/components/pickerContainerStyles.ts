/**
 * Minimal CSS for date picker when rendered inside shadow root or iframe.
 * Scoped so the calendar remains readable; variables match main app.
 */
export const PICKER_CONTAINER_STYLES = `
:host, body {
  margin: 0;
  font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 15px;
  color: #1f2933;
}
* { box-sizing: border-box; }
:host, :root {
  --bank-bg: #f6f7f9;
  --bank-bg-elevated: #ffffff;
  --bank-border: #d4d8dc;
  --bank-border-subtle: #e5e8eb;
  --bank-text: #1f2933;
  --bank-text-muted: #52606d;
  --bank-radius: 4px;
  --bank-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
[role="application"][aria-label="Calendar"] {
  background: var(--bank-bg-elevated);
  border: 1px solid var(--bank-border-subtle);
  border-radius: var(--bank-radius);
  padding: 0.75rem;
}
[role="application"][aria-label="Calendar"] [role="grid"] {
  border-collapse: collapse;
  width: 100%;
}
[role="application"][aria-label="Calendar"] th {
  padding: 0.35rem 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--bank-text-muted);
  text-align: center;
}
[role="application"][aria-label="Calendar"] td {
  padding: 2px;
  text-align: center;
}
[role="application"][aria-label="Calendar"] td button {
  min-width: 2rem;
  min-height: 2rem;
  padding: 0.25rem;
  border-radius: var(--bank-radius);
  border: 1px solid var(--bank-border-subtle);
  background: transparent;
}
[role="application"][aria-label="Calendar"] td button:hover:not(:disabled) {
  background: var(--bank-bg);
  border-color: var(--bank-border);
}
[role="application"][aria-label="Calendar"] td button:disabled {
  opacity: 0.5;
}
`.trim()
