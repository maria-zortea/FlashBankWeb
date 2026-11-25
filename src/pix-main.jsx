import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PixPage from './pages/PixPage.jsx'
import { applyStoredTheme } from './lib/theme.js'

applyStoredTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PixPage />
  </StrictMode>,
)
