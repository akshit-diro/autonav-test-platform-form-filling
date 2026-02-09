import { Link } from 'react-router-dom'

export function NotAuthorizedPage() {
  return (
    <div>
      <h1>Not authorized</h1>
      <p>You do not have access to this page.</p>
      <Link to="/">Go to home</Link>
    </div>
  )
}
