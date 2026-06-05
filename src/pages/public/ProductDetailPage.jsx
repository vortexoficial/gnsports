import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import OptimizedImage from '../../components/OptimizedImage.jsx'
import ProductCard from '../../components/ProductCard.jsx'
import { isSupabaseConfigured } from '../../config/env.js'
import { getProductBySlug, listProducts } from '../../services/productsService.js'
import { formatCurrency, getProductTypeLabel } from '../../utils/formatters.js'
import {
  buildProductWhatsappMessage,
  createWhatsappLink,
} from '../../utils/whatsapp.js'

function ProductDetailPage() {
  const { slug } = useParams()
  const { settings } = useOutletContext()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    async function loadProduct() {
      try {
        const nextProduct = await getProductBySlug(slug)
        setProduct(nextProduct)

        if (nextProduct) {
          const related = await listProducts({
            onlyActive: true,
            type: nextProduct.type,
            limit: 5,
          })
          setRelatedProducts(related.filter((item) => item.id !== nextProduct.id).slice(0, 4))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [slug])

  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/produto/${slug}`
      : `/produto/${slug}`
  const purchaseLink = createWhatsappLink(
    settings.whatsapp_number,
    buildProductWhatsappMessage(product, productUrl),
  )
  const gallery = useMemo(
    () => [product?.image_url, ...(product?.gallery_urls || [])].filter(Boolean),
    [product],
  )

  if (loading) return <Loading />
  if (error) return <div className="form-status error">{error}</div>
  if (!product) {
    return (
      <main className="page">
        <EmptyState
          title="Produto não encontrado"
          message="Confira se o link está correto ou volte para a lista de produtos."
          action={<Link to="/produtos">Ver produtos</Link>}
        />
      </main>
    )
  }

  return (
    <main className="page">
      <div className="product-detail">
        <section className="product-media-panel">
          {gallery.length ? (
            gallery.map((url, index) => (
              <OptimizedImage
                key={url}
                src={url}
                alt={`${product.name} ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            ))
          ) : (
            <div className="image-preview-empty large">Sem imagem</div>
          )}
        </section>

        <section className="product-info-panel">
          <div className="tag-row">
            <span className="tag">{getProductTypeLabel(product.type)}</span>
            {product.category ? <span className="tag">{product.category.name}</span> : null}
            {product.subcategory ? <span className="tag">{product.subcategory}</span> : null}
            {product.promo_price ? <span className="tag hot">Oferta</span> : null}
          </div>
          <h1>{product.name}</h1>
          {product.brand ? <p className="muted-text">Marca: {product.brand}</p> : null}
          <div className="price-row large">
            {product.promo_price ? (
              <span className="old-price">{formatCurrency(product.price)}</span>
            ) : null}
            <strong>{formatCurrency(product.promo_price || product.price)}</strong>
          </div>
          <p>{product.description}</p>
          <p className="stock-line">Disponibilidade: {product.stock}</p>

          {product.type === 'suplemento' ? (
            <div className="info-box">
              <strong>Detalhes do produto</strong>
              <p>Consulte tamanhos, tecido, personalização e disponibilidade pelo atendimento.</p>
            </div>
          ) : null}

          {product.type === 'vestuario' ? (
            <div className="info-box">
              <strong>Atendimento personalizado</strong>
              <p>Confira cor, medidas, estoque e formas de pedido pelo atendimento.</p>
            </div>
          ) : null}

          {product.variants?.length ? (
            <div>
              <h2>Variações e tamanhos</h2>
              <div className="variant-list">
                {product.variants.map((variant) => (
                  <span key={variant.id} className="tag">
                    {variant.variant_type}: {variant.name} ({variant.stock})
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="detail-actions">
            {purchaseLink ? (
              <a
                className="button whatsapp-button"
                href={purchaseLink}
                target="_blank"
                rel="noreferrer"
              >
                Comprar
              </a>
            ) : null}
          </div>
        </section>
      </div>

      {relatedProducts.length ? (
        <section className="content-section no-padding related-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Relacionados</span>
              <h2>Você também pode se interessar</h2>
            </div>
          </div>
          <div className="product-grid">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                whatsappNumber={settings.whatsapp_number}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}

export default ProductDetailPage
