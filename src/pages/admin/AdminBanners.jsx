import { useEffect, useRef, useState } from 'react'
import { useConfirm } from '../../components/ConfirmModal.jsx'
import FormStatus from '../../components/FormStatus.jsx'
import Loading from '../../components/Loading.jsx'
import NumberInput from '../../components/NumberInput.jsx'
import { deleteBanner, listBanners, saveBanner } from '../../services/bannersService.js'
import { uploadStoreImage } from '../../services/storageService.js'

const emptyBanner = {
  id: '',
  title: '',
  desktop_image_url: '',
  mobile_image_url: '',
  desktop_position: 'center center',
  mobile_position: 'center center',
  display_order: 1,
  is_active: true,
}

const IcoTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
)

const IcoEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

function ImageField({ label, currentUrl, previewSrc, onFileChange, disabled }) {
  const inputRef = useRef(null)
  const displaySrc = previewSrc || currentUrl

  return (
    <div className="banner-img-field">
      <span className="banner-img-label">{label}</span>
      <div className="banner-img-preview-box" onClick={() => inputRef.current?.click()}>
        {displaySrc ? (
          <img src={displaySrc} alt={label} />
        ) : (
          <div className="banner-img-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Clique para escolher</span>
          </div>
        )}
        <div className="banner-img-overlay">Trocar imagem</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={disabled}
        style={{ display: 'none' }}
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
      />
    </div>
  )
}

function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [form, setForm] = useState(emptyBanner)
  const [desktopFile, setDesktopFile] = useState(null)
  const [mobileFile, setMobileFile] = useState(null)
  const [desktopPreview, setDesktopPreview] = useState(null)
  const [mobilePreview, setMobilePreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { confirm, confirmation } = useConfirm()

  async function loadBanners() {
    setLoading(true)
    try {
      setBanners(await listBanners())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBanners() }, [])

  useEffect(() => {
    if (!desktopFile) { setDesktopPreview(null); return }
    const url = URL.createObjectURL(desktopFile)
    setDesktopPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [desktopFile])

  useEffect(() => {
    if (!mobileFile) { setMobilePreview(null); return }
    const url = URL.createObjectURL(mobileFile)
    setMobilePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [mobileFile])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function resetForm() {
    setForm(emptyBanner)
    setDesktopFile(null)
    setMobileFile(null)
    setError('')
    setSuccess('')
  }

  function editBanner(banner) {
    setForm(banner)
    setDesktopFile(null)
    setMobileFile(null)
    setError('')
    setSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!form.title.trim()) { setError('Informe um nome interno para o banner.'); return }
    if (!desktopFile && !form.desktop_image_url) { setError('Envie a imagem desktop do banner.'); return }
    if (!mobileFile && !form.mobile_image_url) { setError('Envie a imagem mobile do banner.'); return }

    setSaving(true)
    try {
      let desktopImageUrl = form.desktop_image_url
      let mobileImageUrl = form.mobile_image_url
      if (desktopFile) {
        desktopImageUrl = await uploadStoreImage(desktopFile, 'banners/desktop', {
          convertToWebp: true,
          maxWidth: 1920,
          quality: 0.82,
        })
      }
      if (mobileFile) {
        mobileImageUrl = await uploadStoreImage(mobileFile, 'banners/mobile', {
          convertToWebp: true,
          maxWidth: 1086,
          quality: 0.82,
        })
      }

      await saveBanner({
        ...form,
        desktop_image_url: desktopImageUrl,
        mobile_image_url: mobileImageUrl,
        desktop_position: 'center center',
        mobile_position: 'center center',
      })
      resetForm()
      setSuccess('Banner salvo com sucesso.')
      await loadBanners()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const confirmed = await confirm({
      title: 'Excluir banner?',
      message: 'O banner será removido da vitrine da loja.',
      confirmLabel: 'Excluir',
      tone: 'danger',
    })
    if (!confirmed) return
    try {
      await deleteBanner(id)
      setBanners((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const isEditing = Boolean(form.id)

  return (
    <section className="admin-page banners-admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Home</span>
          <h1>Banners</h1>
        </div>
      </div>

      <form className="panel banner-form-panel" onSubmit={handleSubmit}>
        <div className="panel-heading"><span>01</span><strong>{isEditing ? 'Editar banner' : 'Novo banner'}</strong></div>

        <div className="banner-settings-grid">
          <label className="banner-title-field">
            Nome interno <span className="field-required">*</span>
            <input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ex.: Banner promoção de verão"
              required
            />
          </label>
          <label className="banner-order-field">
            Ordem de exibição
            <NumberInput
              min="1"
              value={form.display_order}
              onChange={(value) => updateField('display_order', value)}
            />
          </label>
          <label className="checkbox-label banner-active-field">
            <input type="checkbox" checked={form.is_active} onChange={(e) => updateField('is_active', e.target.checked)} />
            Banner ativo
          </label>
        </div>

        <div className="panel-heading banner-images-heading"><span>02</span><strong>Imagens do banner principal</strong></div>
        <div className="banner-img-row">
          <ImageField
            label="Desktop"
            currentUrl={form.desktop_image_url}
            previewSrc={desktopPreview}
            onFileChange={setDesktopFile}
            disabled={saving}
          />
          <ImageField
            label="Mobile (1086x1448)"
            currentUrl={form.mobile_image_url}
            previewSrc={mobilePreview}
            onFileChange={setMobileFile}
            disabled={saving}
          />
        </div>

        <FormStatus error={error} success={success} />
        <div className="form-actions">
          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar banner'}
          </button>
          <button className="button secondary" type="button" onClick={resetForm}>Limpar</button>
        </div>
      </form>

      {loading ? <Loading /> : null}

      {banners.length ? (
        <div className="banners-list">
          {banners.map((banner) => (
            <div key={banner.id} className={`banner-row${!banner.is_active ? ' banner-row--inactive' : ''}`}>
              <div className="banner-row-order">#{banner.display_order}</div>
              <div className="banner-row-thumbs">
                {banner.desktop_image_url ? (
                  <img className="banner-thumb" src={banner.desktop_image_url} alt="Desktop" />
                ) : <div className="banner-thumb-empty">D</div>}
                {banner.mobile_image_url ? (
                  <img className="banner-thumb mobile" src={banner.mobile_image_url} alt="Mobile" />
                ) : <div className="banner-thumb-empty">M</div>}
              </div>
              <div className="banner-row-info">
                <strong>{banner.title}</strong>
                <span>Principal: desktop e mobile</span>
              </div>
              <span className={`status-badge ${banner.is_active ? 'active' : 'inactive'}`}>
                {banner.is_active ? 'Ativo' : 'Inativo'}
              </span>
              <div className="banner-row-actions">
                <button type="button" className="action-btn edit" onClick={() => editBanner(banner)} title="Editar">
                  <IcoEdit />
                </button>
                <button type="button" className="action-btn delete" onClick={() => handleDelete(banner.id)} title="Excluir">
                  <IcoTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (!loading ? (
        <div className="panel empty-panel">Nenhum banner cadastrado.</div>
      ) : null)}
      {confirmation}
    </section>
  )
}

export default AdminBanners
