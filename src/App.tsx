import { AuthProvider } from './auth/AuthContext'
import { Router } from './app/Router'
import { getBankThemeConfig } from './config/bankThemes'

function App() {
  const rootClasses = getBankThemeConfig().rootWrapperClasses.join(' ')
  return (
    <AuthProvider>
      <div className={rootClasses}>
        <Router />
      </div>
    </AuthProvider>
  )
}

export default App
