import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import BenefitGrid from '../../components/BenefitGrid.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import HeroBannerCarousel from '../../components/HeroBannerCarousel.jsx'
import Loading from '../../components/Loading.jsx'
import OptimizedImage from '../../components/OptimizedImage.jsx'
import ProductCarousel from '../../components/ProductCarousel.jsx'
import ProductCard from '../../components/ProductCard.jsx'
import { isSupabaseConfigured } from '../../config/env.js'
import { listBanners } from '../../services/bannersService.js'
import { listPosts } from '../../services/blogService.js'
import { listHomeCategoryBanners } from '../../services/homeCategoryBannersService.js'
import { listProducts } from '../../services/productsService.js'

const CATEGORY_BANNER_COPY = [
  ['novidades', 'Novidades'],
  ['selecoes', 'Seleções'],
  ['clubes', 'Clubes'],
  ['retro', 'Retro'],
  ['esportes', 'Esportes'],
  ['esportivos', 'Esportes'],
  ['camisas', 'Camisas'],
  ['produtos', 'Produtos'],
  ['ofertas', 'Ofertas'],
]

function normalizeBannerText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function findCategoryBannerCopy(value) {
  const key = normalizeBannerText(value)
  return CATEGORY_BANNER_COPY.find(([term]) => key.includes(term))?.[1]
}

function getCategoryBannerCopy(slot) {
  if (Number(slot.slot) === 1) return 'Novidades'

  return (
    findCategoryBannerCopy(slot.name) ||
    findCategoryBannerCopy(slot.link_to) ||
    slot.name ||
    'Produtos'
  )
}

function getCategoryBannerLink(slot) {
  if (Number(slot.slot) === 1) return '/produtos'
  return slot.link_to || '/produtos'
}

function IconWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a8.5 8.5 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  )
}

function Home() {
  const { settings } = useOutletContext()
  const [products, setProducts] = useState([])
  const [supplements, setSupplements] = useState([])
  const [clothing, setClothing] = useState([])
  const [promos, setPromos] = useState([])
  const [banners, setBanners] = useState([])
  const [categoryBanners, setCategoryBanners] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    async function loadHome() {
      try {
        const [featuredProducts, activeBanners, latestPosts, catBanners] = await Promise.all([
          listProducts({ onlyActive: true, featured: true, limit: 12 }),
          listBanners({ onlyActive: true }),
          listPosts({ onlyPublished: true, limit: 3 }),
          listHomeCategoryBanners().catch(() => []),
        ])
        const [shirtProducts, sportsProducts, accessoryProducts, promoProducts] = await Promise.all([
          listProducts({ onlyActive: true, type: 'suplemento', limit: 8 }),
          listProducts({ onlyActive: true, type: 'vestuario', limit: 4 }),
          listProducts({ onlyActive: true, type: 'acessorio', limit: 4 }),
          listProducts({ onlyActive: true, limit: 8 }),
        ])
        setProducts(featuredProducts)
        setSupplements(shirtProducts.slice(0, 4))
        setClothing([...sportsProducts, ...accessoryProducts].slice(0, 4))
        setPromos(promoProducts.filter((product) => product.promo_price).slice(0, 4))
        setBanners(activeBanners)
        setCategoryBanners(catBanners)
        setRecentPosts(latestPosts)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadHome()
  }, [])

  return (
    <main className="home-page">
      <HeroBannerCarousel banners={banners} />

      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Categorias</span>
            <h2>Escolha seu produto</h2>
          </div>
        </div>
        {categoryBanners.length > 0 ? (
          <div className="cat-home-grid">
            {categoryBanners.map((slot) => {
              const title = getCategoryBannerCopy(slot)
              const linkTo = getCategoryBannerLink(slot)

              return (
                <Link
                  key={slot.id}
                  className="cat-home-item"
                  to={linkTo}
                  aria-label={title}
                >
                  {slot.image_url ? (
                    <OptimizedImage src={slot.image_url} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="cat-home-placeholder">{title}</span>
                  )}
                  <span className="cat-home-copy">
                    <strong>{title}</strong>
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="category-grid premium-categories">
            <Link className="category-link category-featured" to="/produtos" style={{ '--cat-img': 'url(/demo-shirts/camisa-rubro-negra-demo.png)' }}>
              <strong>Novidades</strong>
            </Link>
            <Link className="category-link category-featured" to="/camisas" style={{ '--cat-img': 'url(/demo-shirts/camisa-brasil-amarela-demo.png)' }}>
              <strong>Camisas</strong>
            </Link>
            <Link className="category-link category-featured" to="/esportes" style={{ '--cat-img': 'url(/demo-sports-items/bola-campo-gold-demo.png)' }}>
              <strong>Esportes</strong>
            </Link>
            <Link className="category-link category-featured" to="/ofertas?sort=promocoes" style={{ '--cat-img': 'url(/demo-shirts/camisa-branca-dourada-demo.png)' }}>
              <strong>Ofertas</strong>
            </Link>
          </div>
        )}
      </section>

      <section className="content-section compact-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Vitrine</span>
            <h2>Produtos em destaque</h2>
          </div>
          <Link to="/produtos">Ver todos</Link>
        </div>

        {loading ? <Loading /> : null}
        {error ? <div className="form-status error">{error}</div> : null}
        {!loading && !products.length ? (
          <EmptyState
            title="Nenhum destaque cadastrado"
            message="Ative produtos como destaque no painel administrativo."
          />
        ) : null}
        <ProductCarousel products={products} whatsappNumber={settings.whatsapp_number} />
      </section>

      {promos.length ? (
        <section className="promo-band">
          <div>
            <span className="eyebrow">Ofertas</span>
            <h2>{settings.promo_title}</h2>
            <p>{settings.promo_text}</p>
          </div>
          <Link className="button" to="/ofertas?sort=promocoes">
            Ver ofertas
          </Link>
        </section>
      ) : null}

      <section className="content-section compact-section split-products">
        <div>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Torcida</span>
              <h2>Camisas de clubes e seleções</h2>
            </div>
          </div>
          <div className="product-grid small-grid">
            {supplements.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                whatsappNumber={settings.whatsapp_number}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Esportes</span>
              <h2>Itens esportivos em destaque</h2>
            </div>
          </div>
          <div className="product-grid small-grid">
            {clothing.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                whatsappNumber={settings.whatsapp_number}
              />
            ))}
          </div>
        </div>
      </section>

      {recentPosts.length ? (
        <section className="content-section compact-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Blog</span>
              <h2>Últimos artigos</h2>
            </div>
            <Link to="/blog">Ver todos</Link>
          </div>
          <div className="blog-grid blog-grid-home">
            {recentPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="blog-card">
                {post.cover_url ? (
                  <div className="blog-card-cover">
                    <OptimizedImage
                      src={post.cover_url}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : (
                  <div className="blog-card-cover blog-card-cover-placeholder" aria-hidden="true" />
                )}
                <div className="blog-card-body">
                  <h2 className="blog-card-title">{post.title}</h2>
                  {post.excerpt ? <p className="blog-card-excerpt">{post.excerpt}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="content-section muted-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Como funciona</span>
            <h2>Da escolha do produto ao atendimento, com orientação clara</h2>
          </div>
        </div>
        <BenefitGrid />
      </section>

      <section className="final-cta" aria-labelledby="final-cta-title">
        <div className="final-cta-inner">
          <div className="final-cta-copy">
            <span className="eyebrow">GN Sports</span>
            <h2 id="final-cta-title">Encontre sua próxima camisa ou item esportivo sem perder tempo.</h2>
            <p>
              Conte o time, seleção, tamanho ou modalidade que você procura e receba
              atendimento direto para conferir disponibilidade.
            </p>
            <div className="final-cta-points" aria-label="Vantagens do atendimento">
              <span>Curadoria do catálogo</span>
              <span>Tamanhos conferidos</span>
              <span>Pedido pelo WhatsApp</span>
            </div>
          </div>

          <div className="final-cta-contact">
            <span>Atendimento direto</span>
            <strong>Fale com a equipe e avance com clareza.</strong>
            <p>Sem formulário longo. A conversa já começa pelo produto e pelo tamanho que você precisa.</p>
            <div className="final-cta-actions">
              <a
                className="button whatsapp-button final-cta-whatsapp"
                href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(settings.default_message || 'Olá! Quero saber mais sobre os produtos da GN Sports.')}`}
                target="_blank"
                rel="noreferrer"
              >
                <IconWhatsapp />
                Chamar no WhatsApp
              </a>
              <Link className="button secondary final-cta-secondary" to="/produtos">
                Ver produtos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
