import { useState } from 'react'
import { Link } from 'react-router-dom'
import CheckoutModal from './CheckoutModal.jsx'
import { formatCurrency, getProductTypeLabel } from '../utils/formatters.js'

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
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const price = product.promo_price || product.price
  const categoryName = product.category?.name || product.categories?.name || getProductTypeLabel(product.type)
  const metaLabel = product.subcategory
    ? `${categoryName} / ${product.subcategory}`
    : categoryName

  return (
    <>
      <article className="product-card">
        <Link className="product-card-media" to={`/produto/${product.slug}`}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} loading="lazy" />
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
            <Link to={`/produto/${product.slug}`}>{product.name}</Link>
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
              <Link className="button mini secondary" to={`/produto/${product.slug}`}>
                Ver produto
              </Link>
              <button
                className="button mini"
                type="button"
                onClick={() => setCheckoutOpen(true)}
              >
                Tenho interesse
              </button>
            </div>
          ) : null}
        </div>
      </article>

      {checkoutOpen ? (
        <CheckoutModal
          product={product}
          whatsappNumber={whatsappNumber}
          onClose={() => setCheckoutOpen(false)}
        />
      ) : null}
    </>
  )
}

export default ProductCard
