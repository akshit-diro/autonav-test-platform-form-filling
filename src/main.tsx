import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './config/appConfig'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
