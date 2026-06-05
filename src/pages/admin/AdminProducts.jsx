import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useConfirm } from '../../components/ConfirmModal.jsx'
import Loading from '../../components/Loading.jsx'
import ProductFilters from '../../components/ProductFilters.jsx'
import { listCategories } from '../../services/categoriesService.js'
import {
  createDemoProductBase,
  deleteProduct,
  listProducts,
  toggleProductField,
} from '../../services/productsService.js'
import { formatCurrency, getProductTypeLabel } from '../../utils/formatters.js'

const IcoEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const IcoTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
)

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ search: '', categoryId: '', type: '' })
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { confirm, confirmation } = useConfirm()

  async function loadProducts() {
    setLoading(true)
    try {
      const [nextProducts, nextCategories] = await Promise.all([
        listProducts(),
        listCategories(),
      ])
      setProducts(nextProducts)
      setCategories(nextCategories)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  const filteredProducts = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesSearch = !search || product.name?.toLowerCase().includes(search) || product.brand?.toLowerCase().includes(search)
      const matchesCategory = !filters.categoryId || product.category_id === filters.categoryId
      const matchesType = !filters.type || product.type === filters.type
      return matchesSearch && matchesCategory && matchesType
    })
  }, [products, filters])

  async function handleToggle(product, field) {
    try {
      setSuccess('')
      setError('')
      await toggleProductField(product.id, field, !product[field])
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, [field]: !product[field] } : p))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    const confirmed = await confirm({
      title: 'Excluir produto?',
      message: 'Essa ação remove o produto permanentemente do catálogo.',
      confirmLabel: 'Excluir',
      tone: 'danger',
    })
    if (!confirmed) return
    try {
      setSuccess('')
      setError('')
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCreateDemoProducts() {
    const confirmed = await confirm({
      eyebrow: 'Produtos demo',
      title: 'Criar produtos demo?',
      message: 'Serão criados ou atualizados produtos esportivos e categorias de teste.',
      confirmLabel: 'Criar demo',
      tone: 'primary',
    })
    if (!confirmed) return
    setSeeding(true)
    setError('')
    setSuccess('')
    try {
      const saved = await createDemoProductBase()
      setSuccess(`${saved.length} produtos demo criados com sucesso.`)
      await loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Produtos</h1>
        </div>
        <div className="admin-page-heading-actions">
          <button className="button secondary small" type="button" onClick={handleCreateDemoProducts} disabled={seeding}>
            {seeding ? 'Criando...' : 'Demo'}
          </button>
          <Link className="button" to="/admin/produtos/novo">+ Novo produto</Link>
        </div>
      </div>

      <ProductFilters categories={categories} filters={filters} onChange={setFilters} />

      {error ? <div className="form-status error">{error}</div> : null}
      {success ? <div className="form-status success">{success}</div> : null}
      {loading ? <Loading /> : null}

      <div className="products-table-wrap">
        <table className="products-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th className="col-type">Tipo / Cat.</th>
              <th className="col-price">Preço</th>
              <th className="col-stock">Estoque</th>
              <th className="col-status">Status</th>
              <th className="col-featured">Destaque</th>
              <th className="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="product-cell">
                  {product.image_url ? (
                    <img className="product-thumb" src={product.image_url} alt="" />
                  ) : (
                    <div className="product-thumb-empty" />
                  )}
                  <div>
                    <strong>{product.name}</strong>
                    <span className="product-brand">{product.brand}</span>
                  </div>
                </td>
                <td className="col-type">
                  <span className="type-badge">{getProductTypeLabel(product.type)}</span>
                  {product.category?.name ? (
                    <span className="cat-name">{product.category.name}</span>
                  ) : null}
                </td>
                <td className="col-price">
                  <strong>{formatCurrency(product.promo_price || product.price)}</strong>
                  {product.promo_price ? (
                    <span className="original-price">{formatCurrency(product.price)}</span>
                  ) : null}
                </td>
                <td className="col-stock">
                  <span className={product.stock > 0 ? 'stock-ok' : 'stock-empty'}>{product.stock}</span>
                </td>
                <td className="col-status">
                  <button
                    type="button"
                    className={`status-toggle ${product.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggle(product, 'is_active')}
                  >
                    {product.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="col-featured">
                  <button
                    type="button"
                    className={`status-toggle ${product.is_featured ? 'featured' : 'plain'}`}
                    onClick={() => handleToggle(product, 'is_featured')}
                  >
                    {product.is_featured ? 'Destaque' : 'Normal'}
                  </button>
                </td>
                <td className="col-actions">
                  <Link className="action-btn edit" to={`/admin/produtos/editar/${product.id}`} title="Editar">
                    <IcoEdit />
                  </Link>
                  <button className="action-btn delete" type="button" onClick={() => handleDelete(product.id)} title="Excluir">
                    <IcoTrash />
                  </button>
                </td>
              </tr>
            ))}
            {!filteredProducts.length && !loading ? (
              <tr>
                <td colSpan="7" className="empty-row">Nenhum produto encontrado.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {confirmation}
    </section>
  )
}

export default AdminProducts
