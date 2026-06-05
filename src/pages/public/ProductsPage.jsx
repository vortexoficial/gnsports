import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import ProductCard from '../../components/ProductCard.jsx'
import ProductFilters from '../../components/ProductFilters.jsx'
import { isSupabaseConfigured } from '../../config/env.js'
import { listCategories } from '../../services/categoriesService.js'
import { listProducts } from '../../services/productsService.js'
import {
  formatCurrency,
  formatCurrencyNoCents,
  getProductTypeLabel,
} from '../../utils/formatters.js'

const TYPE_ROUTES = {
  suplemento: '/camisas',
  vestuario: '/esportes',
  acessorio: '/produtos?tipo=acessorio',
  outro: '/produtos?tipo=outro',
}

const SEGMENTS = [
  {
    type: 'suplemento',
    title: 'Camisas',
    subtitle: 'Clubes, seleções, retrôs e modelos para torcer com estilo.',
  },
  {
    type: 'collections',
    title: 'Coleções',
    subtitle: 'Camisas retrô, goleiro, treino e edições especiais.',
    route: '/camisas',
  },
  {
    type: 'offers',
    title: 'Ofertas',
    subtitle: 'Produtos com preço promocional em destaque.',
    route: '/ofertas?sort=promocoes',
  },
]

function CatalogSegmentIcon({ type }) {
  if (type === 'vestuario') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="M8 21h3l4-7h5l4 7h2" />
        <path d="M16 14l-2-4h5l3 4" />
        <circle cx="8" cy="22" r="4" />
        <circle cx="25" cy="22" r="4" />
      </svg>
    )
  }

  if (type === 'offers') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="M6 7h11l9 9-10 10-9-9V7Z" />
        <path d="M11 12h.01" />
        <path d="M13 21l8-8" />
        <path d="M12 14l2 2" />
        <path d="M20 20l-2-2" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M5 19l3-7h16l3 7" />
      <path d="M7 19h18v5H7v-5Z" />
      <path d="M10 24v2" />
      <path d="M22 24v2" />
      <circle cx="11" cy="22" r="2" />
      <circle cx="21" cy="22" r="2" />
    </svg>
  )
}

function getProductPrice(product) {
  return Number(product.promo_price || product.price || 0)
}

function getInventorySummary(products) {
  const prices = products
    .map(getProductPrice)
    .filter((price) => price > 0)

  return {
    total: products.length,
    shirts: products.filter((product) => product.type === 'suplemento').length,
    offers: products.filter((product) => product.promo_price).length,
    cheapest: prices.length ? Math.min(...prices) : 0,
  }
}

function formatResultCount(count) {
  if (count === 1) return '1 produto encontrado'
  return `${count} produtos encontrados`
}

function CatalogOverview({ summary }) {
  const metrics = [
    { label: 'Catálogo ativo', value: summary.total || '-' },
    { label: 'Camisas', value: summary.shirts || '-' },
    { label: 'Ofertas', value: summary.offers || '-' },
    {
      label: 'A partir de',
      value: summary.cheapest ? formatCurrencyNoCents(summary.cheapest) : '-',
      title: summary.cheapest ? formatCurrency(summary.cheapest) : undefined,
      valueClassName: 'is-currency',
    },
  ]

  return (
    <>
      <section className="catalog-overview" aria-label="Resumo do catálogo">
        <div className="catalog-overview-copy">
          <span className="eyebrow">Central do catálogo</span>
          <h2>Comece pelo tipo de produto e aprofunde a busca depois.</h2>
          <p>
            A página de produtos funciona como uma visão geral: mostra o tamanho do
            catálogo, organiza as coleções de camisas, destaca ofertas e leva cada pessoa para a
            listagem certa.
          </p>
          <div className="catalog-overview-actions">
            <Link className="button" to="/camisas">
              Ver camisas
            </Link>
            <Link className="button secondary" to="/ofertas?sort=promocoes">
              Ver ofertas
            </Link>
          </div>
        </div>

        <div className="catalog-metric-grid">
          {metrics.map((metric) => (
            <div className="catalog-metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong
                className={`catalog-metric-value ${metric.valueClassName || ''}`.trim()}
                title={metric.title}
              >
                {metric.value}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="catalog-segment-grid" aria-label="Atalhos por segmento">
        {SEGMENTS.map((segment) => {
          const count =
            segment.type === 'offers' ? summary.offers : summary.shirts
          const route = segment.route || TYPE_ROUTES[segment.type] || '/produtos'

          return (
            <Link className="catalog-segment-card" key={segment.type} to={route}>
              <span className="catalog-segment-icon">
                <CatalogSegmentIcon type={segment.type} />
              </span>
              <span className="catalog-segment-body">
                <strong>{segment.title}</strong>
                <span>{segment.subtitle}</span>
              </span>
              <span className="catalog-segment-meta">
                {count || 0} {count === 1 ? 'opção' : 'opções'}
              </span>
            </Link>
          )
        })}
      </section>
    </>
  )
}

function ProductsPage({ lockedType = '', pageVariant = 'catalog' }) {
  const { settings } = useOutletContext()
  const [searchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    categoryId: searchParams.get('categoria') || '',
    type: lockedType || searchParams.get('tipo') || '',
    sort: searchParams.get('sort') || (pageVariant === 'offers' ? 'promocoes' : 'recentes'),
  })

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    async function loadData() {
      try {
        const [activeCategories, activeProducts] = await Promise.all([
          listCategories({ onlyActive: true }),
          listProducts({ onlyActive: true }),
        ])
        setCategories(activeCategories)
        setProducts(activeProducts)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    const filtered = products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name?.toLowerCase().includes(search) ||
        product.brand?.toLowerCase().includes(search)
      const matchesCategory =
        !filters.categoryId || product.category_id === filters.categoryId
      const matchesType = !filters.type || product.type === filters.type
      const matchesOfferPage =
        pageVariant !== 'offers' || Boolean(product.promo_price)

      return matchesSearch && matchesCategory && matchesType && matchesOfferPage
    })

    return filtered.sort((a, b) => {
      const priceA = Number(a.promo_price || a.price || 0)
      const priceB = Number(b.promo_price || b.price || 0)

      if (filters.sort === 'menor_preco') return priceA - priceB
      if (filters.sort === 'maior_preco') return priceB - priceA
      if (filters.sort === 'promocoes') {
        return Number(Boolean(b.promo_price)) - Number(Boolean(a.promo_price))
      }

      return new Date(b.created_at) - new Date(a.created_at)
    })
  }, [products, filters, pageVariant])

  const visibleCategories = useMemo(() => {
    const categoryType = lockedType || filters.type

    if (!categoryType) return categories

    return categories.filter(
      (category) =>
        category.type === categoryType || category.id === filters.categoryId,
    )
  }, [categories, filters.categoryId, filters.type, lockedType])

  const summary = useMemo(() => getInventorySummary(products), [products])

  const heading =
    lockedType === 'suplemento'
      ? { title: 'Camisas', subtitle: 'Camisas de clubes, seleções e modelos especiais para você conferir pelo WhatsApp.' }
      : lockedType === 'vestuario'
      ? { title: 'Esportes', subtitle: 'Itens esportivos para treino, jogo e rotina, com atendimento direto.' }
      : pageVariant === 'offers'
      ? { title: 'Ofertas', subtitle: 'Oportunidades com preço promocional para você chamar no WhatsApp e pedir rápido.' }
      : { title: 'Produtos', subtitle: 'Filtre, compare e fale direto pelo WhatsApp para tirar dúvidas ou pedir.' }

  const hasActiveCatalogFilters = Boolean(
    filters.search ||
      filters.categoryId ||
      filters.type ||
      (filters.sort && filters.sort !== 'recentes'),
  )
  const showOverview = pageVariant === 'overview' && !hasActiveCatalogFilters

  return (
    <main className="page">
      <section className="page-heading catalog-heading">
        <div>
          <span className="eyebrow">GN Sports</span>
          <h1>{heading.title}</h1>
          <p>{heading.subtitle}</p>
        </div>
        {lockedType ? (
          <div className="catalog-heading-card" aria-label={`Página de ${heading.title}`}>
            <span>Segmento</span>
            <strong>{getProductTypeLabel(lockedType)}</strong>
          </div>
        ) : null}
      </section>

      {showOverview ? <CatalogOverview summary={summary} /> : null}

      <ProductFilters
        categories={visibleCategories}
        filters={filters}
        onChange={setFilters}
        showType={!lockedType}
        lockedType={lockedType}
        showSort
      />

      {loading ? <Loading /> : null}
      {error ? <div className="form-status error">{error}</div> : null}
      {!loading ? (
        <div className="catalog-status-row">
          <span>{formatResultCount(filteredProducts.length)}</span>
          {lockedType ? (
            <strong>{getProductTypeLabel(lockedType)}</strong>
          ) : pageVariant === 'offers' ? (
            <strong>Somente ofertas</strong>
          ) : (
            <strong>Todos os segmentos</strong>
          )}
        </div>
      ) : null}
      {!loading && !filteredProducts.length ? (
        <EmptyState
          title={pageVariant === 'offers' ? 'Nenhuma oferta encontrada' : 'Nenhum produto encontrado'}
          message={pageVariant === 'offers' ? 'Cadastre um preço promocional ou ajuste os filtros.' : 'Ajuste os filtros ou cadastre novos produtos no painel.'}
        />
      ) : null}

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            whatsappNumber={settings.whatsapp_number}
          />
        ))}
      </div>
    </main>
  )
}

export default ProductsPage
