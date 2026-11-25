import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CardsPage from './pages/CardsPage.jsx'
import { applyStoredTheme } from './lib/theme.js'

applyStoredTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CardsPage />
  </StrictMode>,
)
