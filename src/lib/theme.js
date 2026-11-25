import demoUser from '../data/user.json'
import { getAccountValue } from './accounts.js'
import { store } from './store.js'

export function applyTheme(theme) {
  const selectedTheme = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = selectedTheme
  document.documentElement.style.colorScheme = selectedTheme
}

export function applyStoredTheme() {
  const cpf = store.get('session')?.cpf ?? store.get('lastAccountCpf') ?? demoUser.cpf
  applyTheme(getAccountValue('theme', 'light', cpf))
}
