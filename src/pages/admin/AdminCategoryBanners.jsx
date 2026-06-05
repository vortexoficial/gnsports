import { useEffect, useRef, useState } from 'react'
import Loading from '../../components/Loading.jsx'
import { listHomeCategoryBanners, updateHomeCategoryBanner } from '../../services/homeCategoryBannersService.js'
import { uploadStoreImage } from '../../services/storageService.js'

const IcoImage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const IcoUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const IcoCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

function SlotCard({ slot, onSaved }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [name, setName] = useState(slot.name || '')
  const [linkTo, setLinkTo] = useState(slot.link_to || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const displaySrc = preview || slot.image_url

  async function handleSave() {
    if (!name.trim()) { setError('Informe o nome interno.'); return }
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      let imageUrl = slot.image_url
      if (file) imageUrl = await uploadStoreImage(file, 'banners/categorias')
      await updateHomeCategoryBanner(slot.id, { name: name.trim(), link_to: linkTo.trim(), image_url: imageUrl })
      setFile(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      onSaved(slot.id, { name: name.trim(), link_to: linkTo.trim(), image_url: imageUrl })
    } catch (err) {
      setError(err.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const dirty = file || name !== (slot.name || '') || linkTo !== (slot.link_to || '')

  return (
    <div className={`catb-card${saved ? ' catb-card--saved' : ''}`}>
      {/* Preview */}
      <div className="catb-preview" onClick={() => !saving && inputRef.current?.click()}>
        <span className="catb-slot-badge">Slot {slot.slot}</span>

        {displaySrc ? (
          <img src={displaySrc} alt={`Slot ${slot.slot}`} />
        ) : (
          <div className="catb-preview-empty">
            <IcoImage />
            <span>Clique para adicionar imagem</span>
          </div>
        )}

        <div className="catb-preview-overlay">
          <IcoUpload />
          <span>{displaySrc ? 'Trocar imagem' : 'Adicionar imagem'}</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={saving}
        style={{ display: 'none' }}
        onChange={(e) => {
          setFile(e.target.files?.[0] || null)
          setError('')
          setSaved(false)
          e.target.value = ''
        }}
      />

      {/* Fields */}
      <div className="catb-body">
        <div className="catb-fields">
          <label className="catb-field">
            <span>Nome interno</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Camisas"
              disabled={saving}
            />
          </label>
          <label className="catb-field">
            <span>Link ao clicar</span>
            <input
              value={linkTo}
              onChange={(e) => setLinkTo(e.target.value)}
              placeholder="/camisas"
              disabled={saving}
            />
          </label>
        </div>

        {file ? (
          <p className="catb-filename">
            <IcoUpload /> {file.name}
          </p>
        ) : null}

        <div className="catb-footer">
          {error ? <span className="catb-error">{error}</span> : <span />}
          <button
            type="button"
            className={`button small catb-save-btn${saved ? ' catb-save-btn--ok' : ''}`}
            onClick={handleSave}
            disabled={saving || (!dirty && !file)}
          >
            {saving ? 'Salvando...' : saved ? <><IcoCheck /> Salvo</> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminCategoryBanners() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listHomeCategoryBanners()
      .then(setSlots)
      .catch((err) => setError(err.message || 'Erro ao carregar.'))
      .finally(() => setLoading(false))
  }, [])

  function handleSaved(id, fields) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...fields } : s)))
  }

  const filled = slots.filter((s) => s.image_url).length

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Home</span>
          <h1>Banners de Categoria</h1>
          <p className="admin-page-desc">
            4 slots fixos na seção "Escolha sua categoria". O nome aparece em destaque sobre cada banner.
          </p>
        </div>
        {!loading && slots.length > 0 ? (
          <div className="catb-progress">
            <span className="catb-progress-count">{filled}<em>/4</em></span>
            <span className="catb-progress-label">com imagem</span>
          </div>
        ) : null}
      </div>

      {loading ? <Loading /> : null}

      {error ? <div className="panel empty-panel">{error}</div> : null}

      {!loading && !error && slots.length === 0 ? (
        <div className="panel empty-panel">
          Tabela não encontrada. Execute o SQL de configuração no Supabase.
        </div>
      ) : null}

      {!loading && slots.length > 0 ? (
        <div className="catb-grid">
          {slots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} onSaved={handleSaved} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default AdminCategoryBanners
