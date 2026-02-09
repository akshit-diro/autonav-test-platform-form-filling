import { AuthProvider } from './auth/AuthContext'
import { Router } from './app/Router'

function App() {
  return (
    <AuthProvider>
      <div className="bank-app">
        <Router />
      </div>
    </AuthProvider>
  )
}

export default App
