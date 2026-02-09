import { AuthProvider } from './auth/AuthContext'
import { Router } from './app/Router'

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}

export default App
