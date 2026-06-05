import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loading from '../../components/Loading.jsx'
import { getDashboardSummary } from '../../services/dashboardService.js'

const IcoBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16V8z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
  </svg>
)

const IcoTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

const IcoImage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const IcoPost = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
)

const IcoPeople = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
)

const IcoCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IcoTrend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const IcoStore = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

function VisitorBadge({ icon, label, value }) {
  return (
    <div className="dash-visitor-badge">
      <div className="dash-visitor-icon">{icon}</div>
      <strong className="dash-visitor-value">{value ?? '-'}</strong>
      <span className="dash-visitor-label">{label}</span>
    </div>
  )
}

function DashCard({ icon, label, value, to, accent }) {
  return (
    <article className={`dash-card${accent ? ` dash-card--${accent}` : ''}`}>
      <div className="dash-card-icon">{icon}</div>
      <div className="dash-card-body">
        <strong className="dash-card-value">{value}</strong>
        <span className="dash-card-label">{label}</span>
      </div>
      {to ? <Link className="dash-card-link" to={to}>Gerenciar</Link> : null}
    </article>
  )
}

function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const visitors = summary?.visitors
  const hasVisitorData = visitors !== null && visitors !== undefined

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Visão geral</h1>
        </div>
        <div className="admin-page-heading-actions">
          <a className="button secondary dashboard-store-button" href="/" target="_blank" rel="noreferrer">
            <IcoStore />
            <span>Ver loja</span>
          </a>
        </div>
      </div>

      {error ? <div className="form-status error">{error}</div> : null}

      <div className="dash-analytics-panel">
        <div className="dash-analytics-header">
          <div>
            <span className="eyebrow">Analytics</span>
            <h2 className="dash-analytics-title">Visitantes unicos</h2>
          </div>
          {!hasVisitorData ? (
            <span className="dash-analytics-pill">Não configurado</span>
          ) : null}
        </div>
        <div className="dash-visitor-row">
          <VisitorBadge icon={<IcoCalendar />} label="Hoje" value={hasVisitorData ? visitors.today : null} />
          <VisitorBadge icon={<IcoTrend />} label="7 dias" value={hasVisitorData ? visitors.week : null} />
          <VisitorBadge icon={<IcoPeople />} label="30 dias" value={hasVisitorData ? visitors.month : null} />
        </div>
        {!hasVisitorData ? (
          <p className="dash-analytics-tip">
            Execute o SQL da tabela <code>page_views</code> no Supabase para ativar o rastreamento de visitantes.
          </p>
        ) : null}
      </div>

      {summary ? (
        <div className="dash-content-section">
          <span className="eyebrow">Conteúdo da loja</span>
          <div className="dash-grid">
            <DashCard icon={<IcoBox />} label="Produtos" value={summary.products} to="/admin/produtos" accent="orange" />
            <DashCard icon={<IcoTag />} label="Categorias" value={summary.categories} to="/admin/categorias" accent="blue" />
            <DashCard icon={<IcoImage />} label="Banners" value={summary.banners} to="/admin/banners" accent="green" />
            <DashCard icon={<IcoPost />} label="Artigos do blog" value={summary.posts} to="/admin/blog" accent="purple" />
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default AdminDashboard
