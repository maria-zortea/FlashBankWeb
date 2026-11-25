import { useEffect, useRef, useState } from 'react'
import { logout } from '../lib/auth.js'
import { getActiveCpf, getAccountValue, setAccountValue } from '../lib/accounts.js'
import { applyTheme } from '../lib/theme.js'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import Toast from './Toast.jsx'

function AppShell({ activePage, userName, children, onNotify, notice }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [theme, setTheme] = useState(() => getAccountValue('theme', 'light'))
  const menuButtonRef = useRef(null)
  const logoutButtonRef = useRef(null)
  const cancelLogoutRef = useRef(null)
  const confirmLogoutRef = useRef(null)
  const logoutDialogOpenRef = useRef(false)
  const logoutDialogWasOpenRef = useRef(false)

  const closeLogoutDialog = () => setLogoutDialogOpen(false)

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    setAccountValue('theme', nextTheme, getActiveCpf())
    applyTheme(nextTheme)
    onNotify(`Modo ${nextTheme === 'dark' ? 'escuro' : 'claro'} ativado.`)
  }

  function trapLogoutDialogFocus(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeLogoutDialog()
      return
    }

    if (event.key !== 'Tab') return
    const first = cancelLogoutRef.current
    const last = confirmLogoutRef.current
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  useEffect(() => {
    logoutDialogOpenRef.current = logoutDialogOpen
    if (logoutDialogOpen) {
      logoutDialogWasOpenRef.current = true
      cancelLogoutRef.current?.focus()
    } else if (logoutDialogWasOpenRef.current) {
      logoutDialogWasOpenRef.current = false
      logoutButtonRef.current?.focus()
    }
  }, [logoutDialogOpen])

  useEffect(() => {
    if (menuOpen) document.querySelector('#sidebar .nav a')?.focus()
  }, [menuOpen])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        if (logoutDialogOpenRef.current) {
          setLogoutDialogOpen(false)
          return
        }
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    const closeOnWideScreen = (event) => {
      if (event.matches) setMenuOpen(false)
    }
    const wideScreen = window.matchMedia('(min-width: 901px)')

    document.addEventListener('keydown', closeOnEscape)
    wideScreen.addEventListener('change', closeOnWideScreen)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      wideScreen.removeEventListener('change', closeOnWideScreen)
    }
  }, [])

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        isOpen={menuOpen}
        onLogout={() => setLogoutDialogOpen(true)}
        onNotify={onNotify}
        logoutButtonRef={logoutButtonRef}
      />
      <Topbar
        userName={userName}
        isMenuOpen={menuOpen}
        menuButtonRef={menuButtonRef}
        onMenuToggle={() => setMenuOpen((open) => !open)}
        onNotify={onNotify}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      {menuOpen && (
        <button
          className="backdrop"
          type="button"
          aria-label="Fechar menu"
          onClick={() => {
            setMenuOpen(false)
            menuButtonRef.current?.focus()
          }}
        />
      )}
      <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
      {children}
      <footer className="footer">
        <span>FlashBank. Com você em cada plano.</span>
        <span>Privacidade · Segurança · Ajuda</span>
      </footer>
      <Toast message={notice} />
      {logoutDialogOpen && (
        <div
          className="logout-dialog-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLogoutDialog()
          }}
        >
          <section
            className="logout-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
            onKeyDown={trapLogoutDialogFocus}
          >
            <h2 id="logout-dialog-title">Sair da sua conta?</h2>
            <p id="logout-dialog-description">Você poderá entrar novamente com seu CPF e senha.</p>
            <div className="logout-dialog__actions">
              <button ref={cancelLogoutRef} className="btn btn--outline" type="button" onClick={closeLogoutDialog}>
                Continuar conectado
              </button>
              <button ref={confirmLogoutRef} className="btn btn--primary" type="button" onClick={logout}>
                Sair da conta
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default AppShell
