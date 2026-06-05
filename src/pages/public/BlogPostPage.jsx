import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loading from '../../components/Loading.jsx'
import OptimizedImage from '../../components/OptimizedImage.jsx'
import { getPostBySlug } from '../../services/blogService.js'

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPostBySlug(slug)
      .then((data) => {
        if (!data) setError('Artigo não encontrado.')
        else setPost(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Loading />

  if (error || !post) {
    return (
      <main className="page">
        <div className="form-status error">{error || 'Artigo não encontrado.'}</div>
        <Link to="/blog" className="button secondary" style={{ marginTop: 16 }}>← Voltar ao blog</Link>
      </main>
    )
  }

  return (
    <main className="page blog-post-page">
      {post.cover_url ? (
        <div className="blog-post-cover">
          <OptimizedImage src={post.cover_url} alt={post.title} loading="eager" decoding="async" />
        </div>
      ) : null}

      <div className="blog-post-header">
        <Link to="/blog" className="blog-post-back">← Blog</Link>
        <time className="blog-card-date">
          {formatDate(post.published_at || post.created_at)}
        </time>
        <h1>{post.title}</h1>
        {post.excerpt ? <p className="blog-post-excerpt">{post.excerpt}</p> : null}
      </div>

      <div
        className="blog-post-content"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />
    </main>
  )
}

export default BlogPostPage
