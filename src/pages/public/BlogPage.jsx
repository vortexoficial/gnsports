import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import OptimizedImage from '../../components/OptimizedImage.jsx'
import { listPosts } from '../../services/blogService.js'

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function BlogCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="blog-card">
      {post.cover_url ? (
        <div className="blog-card-cover">
          <OptimizedImage src={post.cover_url} alt={post.title} loading="lazy" decoding="async" />
        </div>
      ) : (
        <div className="blog-card-cover blog-card-cover-placeholder" aria-hidden="true" />
      )}
      <div className="blog-card-body">
        <time className="blog-card-date">{formatDate(post.published_at || post.created_at)}</time>
        <h2 className="blog-card-title">{post.title}</h2>
        {post.excerpt ? <p className="blog-card-excerpt">{post.excerpt}</p> : null}
        <span className="blog-card-read">Ler artigo</span>
      </div>
    </Link>
  )
}

function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listPosts({ onlyPublished: true })
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">Conteúdo</span>
        <h1>Blog</h1>
        <p>Dicas, novidades e orientações para escolher camisas e itens esportivos.</p>
      </div>

      {loading ? <Loading /> : null}
      {error ? <div className="form-status error">{error}</div> : null}

      {!loading && !posts.length ? (
        <EmptyState
          title="Nenhum artigo publicado"
          message="Em breve novos conteúdos por aqui."
        />
      ) : null}

      <div className="blog-grid">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  )
}

export default BlogPage
