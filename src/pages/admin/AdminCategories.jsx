import { useEffect, useState } from 'react'
import { useConfirm } from '../../components/ConfirmModal.jsx'
import CustomSelect from '../../components/CustomSelect.jsx'
import FormStatus from '../../components/FormStatus.jsx'
import Loading from '../../components/Loading.jsx'
import { PRODUCT_TYPES } from '../../data/options.js'
import {
  deleteCategory,
  listCategories,
  saveCategory,
} from '../../services/categoriesService.js'

const emptyCategory = { id: '', name: '', slug: '', type: '', is_active: true }
const categoryTypeOptions = [
  { value: '', label: 'Geral' },
  ...PRODUCT_TYPES,
]

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

const IcoPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyCategory)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { confirm, confirmation } = useConfirm()

  async function loadCategories() {
    setLoading(true)
    try {
      setCategories(await listCategories())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCategories() }, [])

  function editCategory(category) {
    setForm(category)
    setSuccess('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!form.name.trim()) { setError('Informe o nome da categoria.'); return }
    setSaving(true)
    try {
      await saveCategory(form)
      setForm(emptyCategory)
      setSuccess('Categoria salva com sucesso.')
      await loadCategories()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const confirmed = await confirm({
      title: 'Excluir categoria?',
      message: 'Produtos vinculados podem ficar sem categoria após essa remoção.',
      confirmLabel: 'Excluir',
      tone: 'danger',
    })
    if (!confirmed) return
    try {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const isEditing = Boolean(form.id)

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Categorias</h1>
        </div>
      </div>

      <div className="cats-layout">
        <div className="cats-form-col">
          <div className="panel">
            <div className="panel-heading">
              <IcoPlus />
              <strong>{isEditing ? 'Editar categoria' : 'Nova categoria'}</strong>
            </div>
            <form className="cats-form" onSubmit={handleSubmit}>
              <label>
                Nome <span className="field-required">*</span>
                <input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ex: Sedans"
                  required
                />
              </label>
              <label>
                Slug (URL)
                <input
                  value={form.slug || ''}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="gerado automaticamente"
                />
              </label>
              <label>
                Tipo
                <CustomSelect
                  value={form.type || ''}
                  onChange={(value) => updateField('type', value)}
                  options={categoryTypeOptions}
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                />
                Categoria ativa
              </label>
              <FormStatus error={error} success={success} />
              <div className="form-actions">
                <button className="button" type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : isEditing ? 'Salvar edição' : 'Criar categoria'}
                </button>
                {isEditing ? (
                  <button className="button secondary" type="button" onClick={() => setForm(emptyCategory)}>
                    Cancelar
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>

        <div className="cats-list-col">
          {loading ? <Loading /> : null}
          {!loading && !categories.length ? (
            <div className="panel empty-panel">
              <p>Nenhuma categoria cadastrada ainda.</p>
            </div>
          ) : null}
          {categories.length ? (
            <div className="cats-grid">
              {categories.map((cat) => (
                <div key={cat.id} className={`cat-card${!cat.is_active ? ' cat-card--inactive' : ''}`}>
                  <div className="cat-card-body">
                    <strong>{cat.name}</strong>
                    <div className="cat-card-meta">
                      <span className="cat-slug">{cat.slug}</span>
                      {cat.type ? <span className="cat-type">{cat.type}</span> : null}
                    </div>
                  </div>
                  <div className="cat-card-status">
                    <span className={`status-dot ${cat.is_active ? 'active' : 'inactive'}`} />
                    {cat.is_active ? 'Ativa' : 'Inativa'}
                  </div>
                  <div className="cat-card-actions">
                    <button type="button" className="action-btn edit" onClick={() => editCategory(cat)} title="Editar">
                      <IcoEdit />
                    </button>
                    <button type="button" className="action-btn delete" onClick={() => handleDelete(cat.id)} title="Excluir">
                      <IcoTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {confirmation}
    </section>
  )
}

export default AdminCategories
