import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import ProductCard from '../../components/ProductCard.jsx'
import { isSupabaseConfigured } from '../../config/env.js'
import { getCategoryBySlug } from '../../services/categoriesService.js'
import { listProducts } from '../../services/productsService.js'

function CategoryPage() {
  const { settings } = useOutletContext()
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    async function loadCategory() {
      try {
        const nextCategory = await getCategoryBySlug(slug)
        setCategory(nextCategory)

        if (nextCategory) {
          const categoryProducts = await listProducts({
            onlyActive: true,
            categoryId: nextCategory.id,
          })
          setProducts(categoryProducts)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [slug])

  if (loading) return <Loading />
  if (error) return <div className="form-status error">{error}</div>

  if (!category) {
    return (
      <main className="page">
        <EmptyState
          title="Categoria não encontrada"
          message="Volte para a loja e escolha uma categoria ativa."
          action={<Link to="/produtos">Ver produtos</Link>}
        />
      </main>
    )
  }

  return (
    <main className="page">
      <section className="page-heading">
        <span className="eyebrow">Categoria</span>
        <h1>{category.name}</h1>
        <p>Produtos ativos vinculados a esta categoria.</p>
      </section>

      {!products.length ? (
        <EmptyState
          title="Sem produtos nesta categoria"
          message="Cadastre ou ative produtos no painel administrativo."
        />
      ) : null}

      <div className="product-grid">
        {products.map((product) => (
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

export default CategoryPage
