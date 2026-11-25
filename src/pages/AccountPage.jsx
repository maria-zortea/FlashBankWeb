import { useEffect, useRef, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import { isLogged, login } from '../lib/auth.js'
import { getAccount, getAccountValue, setAccountValue } from '../lib/bank.js'
import { maskCpf, maskEmail, maskPhone } from '../lib/format.js'
import { store } from '../lib/store.js'

const emptyProfile = { nome: '', email: '', telefone: '' }

function AccountPage() {
  const [user, setUser] = useState(null)
  const [draft, setDraft] = useState(emptyProfile)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const nameInputRef = useRef(null)

  useEffect(() => {
    if (!isLogged()) {
      window.location.replace('../index.html')
      return undefined
    }

    let active = true
    getAccount()
      .then(({ user: base }) => {
        if (!active) return
        const profile = { ...base, ...getAccountValue('profile', {}, base.cpf) }
        setUser(profile)
        setDraft({ nome: profile.nome, email: profile.email, telefone: profile.telefone })
      })
      .catch(() => { if (active) setError('Não foi possível carregar os dados da conta.') })

    return () => { active = false }
  }, [])

  useEffect(() => {
    if (editing) nameInputRef.current?.focus()
  }, [editing])

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(''), 2500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function startEditing() {
    setDraft({ nome: user.nome, email: user.email, telefone: user.telefone })
    setEditing(true)
  }

  function cancelEditing() {
    setDraft({ nome: user.nome, email: user.email, telefone: user.telefone })
    setEditing(false)
  }

  function saveProfile() {
    const profile = {
      nome: draft.nome.trim(),
      email: draft.email.trim(),
      telefone: draft.telefone.trim(),
    }
    const updatedUser = { ...user, ...profile }
    setAccountValue('profile', profile, user.cpf)
    login(updatedUser)
    setUser(updatedUser)
    setDraft(profile)
    setEditing(false)
    setNotice('Alterações salvas.')
  }

  async function shareAccountDetails() {
    const text = `FlashBank · Agência ${user.agencia} · Conta ${user.conta}`
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Área de transferência indisponível')
      await navigator.clipboard.writeText(text)
      setNotice('Dados copiados.')
    } catch {
      setNotice(text)
    }
  }

  const notifyComingSoon = (event) => {
    event.preventDefault()
    setNotice('Esta opção chega em breve.')
  }

  const userName = user?.nome ?? store.get('session')?.nome ?? 'Cliente'

  return (
    <AppShell activePage="account" userName={userName} onNotify={setNotice} notice={notice}>
      <main className="content" id="conteudo" tabIndex="-1">
        {error ? (
          <p className="form-error" role="alert">{error}</p>
        ) : !user ? (
          <p className="muted" role="status">Carregando os dados da conta…</p>
        ) : (
          <>
            <div className="page-head">
              <div>
                <h1>Minha conta</h1>
                <p className="muted">Seus dados e sua segurança, sempre à mão.</p>
              </div>
              <span className="secure-note">
                <span className="icon" data-icon="seguro" aria-hidden="true" />
                Ambiente seguro
              </span>
            </div>

            <section className="card profile" aria-labelledby="acc-nome">
              <span className="avatar avatar--soft avatar--xl" aria-hidden="true">
                <span className="icon" data-icon="avatar" />
              </span>
              <div className="profile__info">
                <h2 id="acc-nome">{user.nome}</h2>
                <small>CPF {maskCpf(user.cpf)}</small>
                <span className="badge"><span aria-hidden="true">✓</span> Conta ativa</span>
              </div>
              {!editing && (
                <button className="btn btn--outline" type="button" onClick={startEditing}>
                  Editar perfil
                </button>
              )}
            </section>

            <div className="grid grid--2">
              <section className="card" aria-labelledby="t-dados">
                <div>
                  <h2 id="t-dados">Dados pessoais</h2>
                  <small>Mantenha suas informações de contato atualizadas.</small>
                </div>
                <form className="fields" onSubmit={(event) => event.preventDefault()}>
                  <label className="field" htmlFor="f-nome">Nome
                    <input
                      ref={nameInputRef}
                      id="f-nome"
                      value={editing ? draft.nome : user.nome}
                      readOnly={!editing}
                      onChange={(event) => setDraft({ ...draft, nome: event.target.value })}
                    />
                  </label>
                  <label className="field" htmlFor="f-cpf">CPF
                    <input id="f-cpf" value={maskCpf(user.cpf)} readOnly />
                  </label>
                  <label className="field" htmlFor="f-email">E-mail
                    <input
                      id="f-email"
                      type="email"
                      value={editing ? draft.email : maskEmail(user.email)}
                      readOnly={!editing}
                      onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                    />
                  </label>
                  <label className="field" htmlFor="f-tel">Celular
                    <input
                      id="f-tel"
                      type="tel"
                      value={editing ? draft.telefone : maskPhone(user.telefone)}
                      readOnly={!editing}
                      onChange={(event) => setDraft({ ...draft, telefone: event.target.value })}
                    />
                  </label>
                </form>
                {editing && (
                  <div className="edit-actions">
                    <button className="btn btn--primary" type="button" onClick={saveProfile}>Salvar alterações</button>
                    <button className="btn btn--outline" type="button" onClick={cancelEditing}>Cancelar</button>
                  </div>
                )}
              </section>

              <section className="card" aria-labelledby="t-conta">
                <div>
                  <h2 id="t-conta">Dados da conta</h2>
                  <small>FlashBank · Conta corrente</small>
                </div>
                <div className="account-data">
                  <div><small>Agência</small><strong>{user.agencia}</strong></div>
                  <div><small>Conta</small><strong>••••{user.conta}</strong></div>
                </div>
                <button className="btn btn--outline" type="button" onClick={shareAccountDetails}>
                  Compartilhar dados da conta
                </button>
              </section>
            </div>

            <div className="grid grid--2">
              <section className="card" aria-labelledby="t-seg">
                <h2 id="t-seg">Segurança e acesso</h2>
                <div className="access-list">
                  <a className="access-item" href="#alterar-senha" onClick={notifyComingSoon}>
                    <span className="icon icon--lg" data-icon="cadeado" aria-hidden="true" />
                    <div><strong>Alterar senha</strong><small>Proteja o acesso à sua conta.</small></div>
                    <span className="icon" data-icon="avancar" aria-hidden="true" />
                  </a>
                  <a className="access-item" href="#dispositivos" onClick={notifyComingSoon}>
                    <span className="icon icon--lg" data-icon="celular" aria-hidden="true" />
                    <div><strong>Dispositivos conectados</strong><small>Gerencie seus acessos.</small></div>
                    <span className="icon" data-icon="avancar" aria-hidden="true" />
                  </a>
                </div>
              </section>
              <section className="card card--soft" aria-labelledby="t-jeito">
                <h2 className="title-icon" id="t-jeito">
                  <span className="icon icon--lg" data-icon="seguro" aria-hidden="true" />
                  Sua conta, do seu jeito
                </h2>
                <p className="muted">Personalize sua experiência e gerencie suas preferências.</p>
                <a className="link card-link" href="#privacidade" onClick={notifyComingSoon}>
                  Gerenciar privacidade e preferências <span aria-hidden="true">↗</span>
                </a>
              </section>
            </div>
          </>
        )}
      </main>
    </AppShell>
  )
}

export default AccountPage
