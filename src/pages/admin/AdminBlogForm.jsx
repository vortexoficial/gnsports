import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FormStatus from '../../components/FormStatus.jsx'
import Loading from '../../components/Loading.jsx'
import { createPost, getPostById, updatePost } from '../../services/blogService.js'

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_url: '',
  published: false,
  published_at: '',
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function wrapSelection(ref, before, after, placeholder = 'texto') {
  const el = ref.current
  if (!el) return null
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = el.value.substring(start, end) || placeholder
  const next = el.value.substring(0, start) + before + selected + after + el.value.substring(end)

  return {
    next,
    cursor: [start + before.length, start + before.length + selected.length],
  }
}

function EditorToolbar({ editorRef, onUpdate }) {
  function wrap(before, after, placeholder) {
    const result = wrapSelection(editorRef, before, after, placeholder)
    if (!result) return
    onUpdate(result.next)
    requestAnimationFrame(() => {
      editorRef.current?.focus()
      editorRef.current?.setSelectionRange(result.cursor[0], result.cursor[1])
    })
  }

  function insertBlock(template) {
    const el = editorRef.current
    if (!el) return
    const pos = el.selectionStart
    const val = el.value
    const before = val.substring(0, pos)
    const after = val.substring(pos)
    const sep = before.length && !before.endsWith('\n') ? '\n' : ''
    onUpdate(before + sep + template + '\n' + after)
    requestAnimationFrame(() => el.focus())
  }

  function insertLink() {
    const url = window.prompt('URL do link:')
    if (!url) return
    wrap(`<a href="${url}">`, '</a>', 'texto do link')
  }

  function insertImage() {
    const url = window.prompt('URL da imagem:')
    if (!url) return
    insertBlock(`<img src="${url}" alt="" />`)
  }

  return (
    <div className="editor-toolbar">
      <button type="button" className="editor-tb-btn" title="Negrito" onClick={() => wrap('<strong>', '</strong>')}>
        <b>B</b>
      </button>
      <button type="button" className="editor-tb-btn" title="Itálico" onClick={() => wrap('<em>', '</em>')}>
        <em>I</em>
      </button>
      <button type="button" className="editor-tb-btn" title="Sublinhado" onClick={() => wrap('<u>', '</u>')}>
        <u>U</u>
      </button>
      <div className="editor-tb-sep" />
      <button type="button" className="editor-tb-btn" title="Título H2" onClick={() => wrap('<h2>', '</h2>', 'Título')}>H2</button>
      <button type="button" className="editor-tb-btn" title="Título H3" onClick={() => wrap('<h3>', '</h3>', 'Subtítulo')}>H3</button>
      <div className="editor-tb-sep" />
      <button type="button" className="editor-tb-btn" title="Parágrafo" onClick={() => wrap('<p>', '</p>', 'parágrafo')}>P</button>
      <button type="button" className="editor-tb-btn" title="Citação" onClick={() => wrap('<blockquote>', '</blockquote>', 'citação')}>"</button>
      <div className="editor-tb-sep" />
      <button type="button" className="editor-tb-btn" title="Lista" onClick={() => insertBlock('<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>')}>UL</button>
      <button type="button" className="editor-tb-btn" title="Lista numerada" onClick={() => insertBlock('<ol>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ol>')}>OL</button>
      <div className="editor-tb-sep" />
      <button type="button" className="editor-tb-btn" title="Código inline" onClick={() => wrap('<code>', '</code>')}>
        {'</>'}
      </button>
      <button type="button" className="editor-tb-btn" title="Bloco de código" onClick={() => insertBlock('<pre><code>\n// código aqui\n</code></pre>')}>
        pre
      </button>
      <div className="editor-tb-sep" />
      <button type="button" className="editor-tb-btn" title="Link" onClick={insertLink}>Link</button>
      <button type="button" className="editor-tb-btn" title="Imagem" onClick={insertImage}>Img</button>
    </div>
  )
}

function AdminBlogForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const editorRef = useRef(null)

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (!isEditing) return
    getPostById(id)
      .then((data) => {
        if (data) setForm({ ...EMPTY, ...data, published_at: data.published_at?.slice(0, 10) || '' })
        else setError('Artigo não encontrado.')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEditing])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleTitleChange(e) {
    const val = e.target.value
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: isEditing ? prev.slug : slugify(val),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.title.trim()) { setError('Informe o título.'); return }
    if (!form.slug.trim()) { setError('Informe o slug.'); return }

    setSaving(true)
    try {
      const payload = {
        ...form,
        published_at: form.published ? (form.published_at || new Date().toISOString()) : null,
      }
      delete payload.id

      if (isEditing) {
        await updatePost(id, payload)
        setSuccess('Artigo atualizado.')
      } else {
        const created = await createPost(payload)
        navigate(`/admin/blog/editar/${created.id}`, { replace: true })
        setSuccess('Artigo criado.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <section className="admin-page blog-editor-page">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Blog</span>
          <h1>{isEditing ? 'Editar artigo' : 'Novo artigo'}</h1>
        </div>
        <div className="admin-page-heading-actions">
          <button className="button secondary small blog-back-button" type="button" onClick={() => navigate('/admin/blog')}>
            Voltar
          </button>
        </div>
      </div>

      <form className="blog-form-grid" onSubmit={handleSubmit}>
        <div className="blog-main-col">
          <div className="panel blog-content-panel">
            <div className="panel-heading"><span>01</span><strong>Conteúdo</strong></div>

            <div className="form-group">
              <label>
                Título
                <input value={form.title} onChange={handleTitleChange} required placeholder="Título do artigo" />
              </label>
            </div>

            <div className="form-row">
              <label>
                Slug (URL)
                <input value={form.slug} onChange={(e) => update('slug', e.target.value)} required />
              </label>
              <label>
                URL da imagem de capa
                <input value={form.cover_url} onChange={(e) => update('cover_url', e.target.value)} placeholder="https://..." />
              </label>
            </div>

            <label>
              Resumo
              <textarea
                value={form.excerpt}
                onChange={(e) => update('excerpt', e.target.value)}
                rows={2}
                placeholder="Breve descrição exibida na listagem..."
              />
            </label>
          </div>

          <div className="panel editor-panel blog-editor-panel">
            <div className="panel-heading">
              <strong>Conteúdo HTML</strong>
              <button
                type="button"
                className={`editor-preview-toggle${showPreview ? ' active' : ''}`}
                onClick={() => setShowPreview((v) => !v)}
              >
                {showPreview ? 'Editor' : 'Preview'}
              </button>
            </div>
            {!showPreview ? (
              <div className="editor-wrap">
                <EditorToolbar editorRef={editorRef} onUpdate={(val) => update('content', val)} />
                <textarea
                  ref={editorRef}
                  className="editor-textarea"
                  value={form.content}
                  onChange={(e) => update('content', e.target.value)}
                  rows={18}
                  placeholder="<p>Escreva o conteúdo em HTML aqui...</p>"
                  spellCheck={false}
                />
              </div>
            ) : (
              <div
                className="editor-preview-area"
                dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:var(--muted)">Sem conteúdo ainda.</p>' }}
              />
            )}
          </div>
        </div>

        <div className="blog-side-col">
          <div className="panel blog-publish-panel">
            <div className="panel-heading"><span>02</span><strong>Publicação</strong></div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => update('published', e.target.checked)}
              />
              Publicado (visível no site)
            </label>

            <label>
              Data de publicação
              <input
                type="date"
                value={form.published_at}
                onChange={(e) => update('published_at', e.target.value)}
              />
            </label>

            {form.cover_url ? (
              <div className="cover-preview">
                <img src={form.cover_url} alt="Capa" />
              </div>
            ) : null}

            <FormStatus error={error} success={success} />

            <div className="form-actions blog-submit-actions">
              <button className="button" type="submit" disabled={saving}>
                {saving ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar artigo'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}

export default AdminBlogForm
