import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function IcoViewStore() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IcoDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function IcoVehicles() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16V8z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  )
}

function IcoCategorias() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function IcoBlog() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
}

function IcoBanners() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function IcoCatBanners() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
      <line x1="8" y1="21" x2="8" y2="17" />
      <line x1="12" y1="21" x2="12" y2="19" />
    </svg>
  )
}

function IcoConfig() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

function IcoLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IcoMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function IcoClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const adminLinks = [
  { to: '/admin', label: 'Visão Geral', icon: <IcoDashboard />, end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: <IcoVehicles /> },
  { to: '/admin/categorias', label: 'Categorias', icon: <IcoCategorias /> },
  { to: '/admin/blog', label: 'Blog', icon: <IcoBlog /> },
  { to: '/admin/banners', label: 'Banners', icon: <IcoBanners /> },
  { to: '/admin/banners-categorias', label: 'Banners Categoria', icon: <IcoCatBanners /> },
  { to: '/admin/configuracoes', label: 'Configurações', icon: <IcoConfig /> },
]

function SidebarContent({ user, signOut }) {
  const initial = user?.email?.[0]?.toUpperCase() || 'A'
  return (
    <>
      <div className="admin-sidebar-top">
        <div className="admin-brand">
          <img src="/logo.webp" alt="GN Sports" className="admin-brand-logo" />
        </div>

        <nav className="admin-nav" aria-label="Navegação administrativa">
          <span className="admin-nav-section">Menu</span>
          {adminLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="admin-nav-item">
              <span className="admin-nav-icon">{link.icon}</span>
              <span className="admin-nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="admin-sidebar-bottom">
        <a className="admin-store-link" href="/" target="_blank" rel="noreferrer">
          <IcoViewStore />
          Ver loja
        </a>
        <div className="admin-user">
          <div className="admin-user-avatar">{initial}</div>
          <div className="admin-user-info">
            <span>Administrador</span>
            <p>{user?.email}</p>
          </div>
        </div>
        <button className="admin-logout" type="button" onClick={signOut}>
          <IcoLogout />
          Sair da conta
        </button>
      </div>
    </>
  )
}

function AdminLayout() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    function onKey(e) { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const initial = user?.email?.[0]?.toUpperCase() || 'A'

  return (
    <div className="admin-shell">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar">
        <SidebarContent user={user} signOut={signOut} />
      </aside>

      {/* Mobile topbar */}
      <header className="admin-topbar">
        <button
          className="admin-hamburger"
          type="button"
          aria-label="Abrir menu"
          onClick={() => setMenuOpen(true)}
        >
          <IcoMenu />
        </button>
        <img src="/logo.webp" alt="GN Sports Admin" className="admin-topbar-logo" />
        <div className="admin-topbar-right">
          <div className="admin-topbar-avatar">{initial}</div>
          <button className="admin-topbar-signout" type="button" onClick={signOut} aria-label="Sair da conta">
            <IcoLogout />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen ? createPortal(
        <div className="admin-drawer-layer">
          <div className="admin-drawer-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <aside className="admin-drawer">
            <button className="admin-drawer-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
              <IcoClose />
            </button>
            <SidebarContent user={user} signOut={signOut} />
          </aside>
        </div>,
        document.body
      ) : null}

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
