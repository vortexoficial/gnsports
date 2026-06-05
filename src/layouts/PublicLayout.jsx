import { useEffect, useLayoutEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

function IconWhatsapp() {
  return (
    <svg className="whatsapp-icon-pro" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a8.5 8.5 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
import BrandLogo from '../components/BrandLogo.jsx'
import MusicPlayer from '../components/MusicPlayer.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import { isSupabaseConfigured } from '../config/env.js'
import { DEFAULT_SETTINGS, getStoreSettings } from '../services/settingsService.js'
import { logVisit } from '../services/visitorsService.js'
import { createWhatsappLink } from '../utils/whatsapp.js'

function PublicLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    getStoreSettings()
      .then(setSettings)
      .catch(() => setSettings(DEFAULT_SETTINGS))
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    logVisit(location.pathname)
  }, [location.pathname])

  const whatsappNumber =
    settings.whatsapp_number?.trim() || DEFAULT_SETTINGS.whatsapp_number
  const supportLink = createWhatsappLink(
    whatsappNumber,
    settings.default_message,
  )

  function submitSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    navigate(`/produtos?${params.toString()}`)
    setMenuOpen(false)
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-header-top">
            <Link className="brand" to="/">
              {settings.logo_url ? (
                <OptimizedImage src={settings.logo_url} alt={settings.store_name} decoding="async" />
              ) : (
                <BrandLogo compact />
              )}
            </Link>

            <form className="header-search" onSubmit={submitSearch}>
              <svg className="header-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar produtos..."
                aria-label="Buscar produtos"
              />
            </form>

            <div className="header-actions">
              {supportLink ? (
                <a
                  className="button small whatsapp-button header-whatsapp-button"
                  href={supportLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconWhatsapp />
                  WhatsApp
                </a>
              ) : null}
              <button
                className="mobile-menu-button"
                type="button"
                aria-expanded={menuOpen}
                aria-controls="public-menu"
                onClick={() => setMenuOpen((current) => !current)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>

          <div className="site-header-bottom">
            <nav
              id="public-menu"
              className={menuOpen ? 'site-nav open' : 'site-nav'}
              aria-label="Navegação pública"
            >
              <NavLink to="/" end onClick={() => setMenuOpen(false)}>
                Início
              </NavLink>
              <NavLink to="/produtos" onClick={() => setMenuOpen(false)}>
                Produtos
              </NavLink>
              <NavLink to="/camisas" onClick={() => setMenuOpen(false)}>
                Camisas
              </NavLink>
              <NavLink to="/esportes" onClick={() => setMenuOpen(false)}>
                Esportes
              </NavLink>
              <NavLink to="/blog" onClick={() => setMenuOpen(false)}>
                Blog
              </NavLink>
              {supportLink ? (
                <a
                  className="button small whatsapp-button site-nav-whatsapp"
                  href={supportLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                >
                  <IconWhatsapp />
                  WhatsApp
                </a>
              ) : null}
            </nav>
          </div>
        </div>
      </header>

      <Outlet context={{ settings }} />

      {/* Floating action buttons */}
      <div className="fabs">
        <MusicPlayer />
        {supportLink ? (
          <a
            className="fab-whatsapp"
            href={supportLink}
            target="_blank"
            rel="noreferrer"
            aria-label="Falar no WhatsApp"
            title="Falar no WhatsApp"
          >
            <IconWhatsapp />
          </a>
        ) : null}
      </div>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-brand-logo">
              {settings.logo_url ? (
                <OptimizedImage
                  src={settings.logo_url}
                  alt={settings.store_name}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <BrandLogo />
              )}
            </Link>
            <strong className="footer-brand-name">{settings.store_name}</strong>
            <p className="footer-brand-desc">Camisas de times, seleções e itens esportivos com atendimento direto.</p>
            <div className="footer-socials">
              {supportLink ? (
                <a href={supportLink} className="footer-social" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                  <IconWhatsapp />
                </a>
              ) : null}
              {settings.instagram_url ? (
                <a href={settings.instagram_url} className="footer-social" aria-label="Instagram" target="_blank" rel="noreferrer">
                  <IconInstagram />
                </a>
              ) : null}
            </div>
          </div>

          <div className="footer-col">
            <span className="footer-col-label">Loja</span>
            <Link to="/produtos">Todos os produtos</Link>
            <Link to="/camisas">Camisas</Link>
            <Link to="/esportes">Esportes</Link>
            <Link to="/ofertas?sort=promocoes">Ofertas</Link>
          </div>

          <div className="footer-col">
            <span className="footer-col-label">Conteúdo</span>
            <Link to="/blog">Blog</Link>
          </div>

          <div className="footer-col footer-cta-col">
            <span className="footer-col-label">Atendimento</span>
            <p>Atendimento pelo WhatsApp para conferir tamanhos, disponibilidade e pedidos.</p>
            {supportLink ? (
              <a href={supportLink} className="button whatsapp-button footer-cta-btn" target="_blank" rel="noreferrer">
                <IconWhatsapp />
                Chamar no WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {settings.store_name}. Todos os direitos reservados.</span>
          <span className="footer-bottom-note">Atendimento e pedidos pelo WhatsApp, sem checkout online.</span>
        </div>
        <div className="footer-dev">
          <hr className="footer-dev-line" />
          <span>Desenvolvido por{' '}<a href="https://agenciafuturadesign.com" target="_blank" rel="noreferrer" aria-label="Futura Design">
            <OptimizedImage
              src="/logo-futura.webp"
              alt="Futura Design"
              className="footer-dev-logo"
              loading="lazy"
              decoding="async"
            />
          </a></span>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
