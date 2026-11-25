import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CreditPage from './pages/CreditPage.jsx'
import { applyStoredTheme } from './lib/theme.js'

applyStoredTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CreditPage />
  </StrictMode>,
)
