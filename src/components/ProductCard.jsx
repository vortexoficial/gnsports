import { Link } from 'react-router-dom'
import OptimizedImage from './OptimizedImage.jsx'
import { formatCurrency, getProductTypeLabel } from '../utils/formatters.js'
import {
  buildProductWhatsappMessage,
  createWhatsappLink,
} from '../utils/whatsapp.js'

function getPlaceholderLabel(type) {
  const labels = {
    acessorio: 'ACC',
    outro: 'AUTO',
    suplemento: 'CAR',
    vestuario: 'MOTO',
  }

  return labels[type] || 'ITEM'
}

function ProductCard({ product, whatsappNumber = '', showActions = true }) {
  const price = product.promo_price || product.price
  const productPath = `/produto/${product.slug}`
  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${productPath}`
      : productPath
  const purchaseLink = createWhatsappLink(
    whatsappNumber,
    buildProductWhatsappMessage(product, productUrl),
  )
  const categoryName = product.category?.name || product.categories?.name || getProductTypeLabel(product.type)
  const metaLabel = product.subcategory
    ? `${categoryName} / ${product.subcategory}`
    : categoryName

  return (
    <article className="product-card">
      <Link className="product-card-media" to={productPath}>
        {product.image_url ? (
          <OptimizedImage
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="product-placeholder">
            <span>{getPlaceholderLabel(product.type)}</span>
          </div>
        )}
        {product.promo_price ? <span className="product-card-badge">Oferta</span> : null}
      </Link>

      <div className="product-card-body">
        <span className="product-card-meta">{metaLabel}</span>
        <h3>
          <Link to={productPath}>{product.name}</Link>
        </h3>
        <p className="product-card-brand">{product.brand || getProductTypeLabel(product.type)}</p>
        <div className="price-row">
          {product.promo_price ? (
            <span className="old-price">{formatCurrency(product.price)}</span>
          ) : null}
          <strong>{formatCurrency(price)}</strong>
        </div>
        {showActions ? (
          <div className="product-card-actions">
            <Link className="button mini secondary" to={productPath}>
              Ver produto
            </Link>
            {purchaseLink ? (
              <a
                className="button mini whatsapp-button"
                href={purchaseLink}
                target="_blank"
                rel="noreferrer"
              >
                Comprar
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default ProductCard
