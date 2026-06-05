import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import FormStatus from '../../components/FormStatus.jsx'
import { isSupabaseConfigured } from '../../config/env.js'
import { useAuth } from '../../context/AuthContext.jsx'

function IconEmail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
      <circle cx="12" cy="16" r="1.2" fill="currentColor" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L3 7v5c0 5 4 9.3 9 10.3C17 21.3 21 17 21 12V7L12 2z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function AdminLogin() {
  const location = useLocation()
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectTo = location.state?.from?.pathname || '/admin'

  if (user) return <Navigate to={redirectTo} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!email || !password) { setError('Informe e-mail e senha.'); return }
    setLoading(true)
    try { await signIn(email, password) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="login-shell">

      {/* Painel da marca */}
      <div className="login-brand" aria-hidden="true">
        <div className="login-brand-glow" />
        <div className="login-brand-lines" />
        <div className="login-brand-inner">
          <img src="/logo.png" alt="GN Sports" className="login-logo" />
          <div className="login-brand-copy">
            <span className="eyebrow">Painel Administrativo</span>
            <p>Gerencie produtos, categorias, banners e configurações da sua loja.</p>
          </div>
          <div className="login-brand-badge">
            <IconShield />
            Área restrita
          </div>
        </div>
      </div>

      {/* Painel do formulário */}
      <div className="login-form-side">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-form-header">
            <span className="eyebrow">Admin</span>
            <h1>Entrar no painel</h1>
            <p>Acesse com suas credenciais de administrador.</p>
          </div>

          {!isSupabaseConfigured ? (
            <FormStatus error="Configure o Supabase em .env.local antes de entrar." />
          ) : null}

          <label>
            E-mail
            <div className="login-input-wrap">
              <IconEmail />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="seu@email.com"
              />
            </div>
          </label>

          <label>
            Senha
            <div className="login-input-wrap">
              <IconLock />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="********"
              />
            </div>
          </label>

          <FormStatus error={error} />

          <button className="button login-submit" type="submit" disabled={loading || !isSupabaseConfigured}>
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>
      </div>

    </div>
  )
}

export default AdminLogin
