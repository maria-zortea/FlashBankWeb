import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AccountPage from './pages/AccountPage.jsx'
import { applyStoredTheme } from './lib/theme.js'

applyStoredTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AccountPage />
  </StrictMode>,
)
