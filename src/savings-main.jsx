import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SavingsPage from './pages/SavingsPage.jsx'
import { applyStoredTheme } from './lib/theme.js'

applyStoredTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SavingsPage />
  </StrictMode>,
)
