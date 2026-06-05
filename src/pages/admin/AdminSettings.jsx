import { useEffect, useState } from 'react'
import FormStatus from '../../components/FormStatus.jsx'
import Loading from '../../components/Loading.jsx'
import { DEFAULT_SETTINGS, getStoreSettings, saveStoreSettings } from '../../services/settingsService.js'

const IcoStore = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const IcoWhatsapp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a8.5 8.5 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
)

const IcoPromo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </svg>
)

function SettingsSection({ icon, number, title, children }) {
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <span className="settings-section-num">{number}</span>
        <div className="settings-section-icon">{icon}</div>
        <strong className="settings-section-title">{title}</strong>
      </div>
      <div className="settings-section-body">{children}</div>
    </div>
  )
}

function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getStoreSettings()
      .then(setSettings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function updateField(name, value) {
    setSettings((current) => ({ ...current, [name]: value }))
  }

  function validateSettings() {
    if (!settings.store_name.trim()) return 'Informe o nome da loja.'
    if (!/^\d{12,13}$/.test(settings.whatsapp_number || '')) {
      return 'Use o WhatsApp no formato 55DDDNUMERO, sem espaços ou símbolos.'
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    const validationError = validateSettings()
    if (validationError) { setError(validationError); return }
    setSaving(true)
    try {
      const saved = await saveStoreSettings(settings)
      setSettings(saved)
      setSuccess('Configurações salvas com sucesso.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Loja</span>
          <h1>Configurações</h1>
        </div>
      </div>

      <form className="settings-form" onSubmit={handleSubmit}>
        <SettingsSection icon={<IcoStore />} number="01" title="Dados da loja">
          <div className="form-grid">
            <label>
              Nome da loja
              <input
                value={settings.store_name}
                onChange={(e) => updateField('store_name', e.target.value)}
                placeholder="Ex.: GN Sports"
                required
              />
            </label>
            <label>
              Logo (URL)
              <input
                value={settings.logo_url || ''}
                onChange={(e) => updateField('logo_url', e.target.value)}
                placeholder="/logo.webp ou https://..."
              />
            </label>
          </div>
          {settings.logo_url ? (
            <div className="settings-logo-preview">
              <img src={settings.logo_url} alt="Logo" />
            </div>
          ) : null}
        </SettingsSection>

        <SettingsSection icon={<IcoWhatsapp />} number="02" title="Contato e redes">
          <div className="form-grid">
            <label>
              WhatsApp
              <input
                value={settings.whatsapp_number || ''}
                onChange={(e) => updateField('whatsapp_number', e.target.value)}
                placeholder="5511999999999"
                required
              />
              <span className="field-hint">Formato: 55 + DDD + número, sem espaços. Ex: 5522992846915</span>
            </label>
            <label>
              Instagram
              <input
                value={settings.instagram_url || ''}
                onChange={(e) => updateField('instagram_url', e.target.value)}
                placeholder="https://instagram.com/sualoja"
              />
            </label>
          </div>
          <label>
            Mensagem padrão do WhatsApp
            <textarea
              value={settings.default_message || ''}
              onChange={(e) => updateField('default_message', e.target.value)}
              rows={2}
              placeholder="Olá! Quero saber mais sobre os produtos..."
            />
          </label>
        </SettingsSection>

        <SettingsSection icon={<IcoPromo />} number="03" title="Ofertas">
          <div className="form-grid">
            <label className="full-field">
              Título da seção de ofertas
              <input
                value={settings.promo_title || ''}
                onChange={(e) => updateField('promo_title', e.target.value)}
                placeholder="Ex.: Produtos em destaque"
              />
            </label>
            <label className="full-field">
              Texto da seção de ofertas
              <textarea
                value={settings.promo_text || ''}
                onChange={(e) => updateField('promo_text', e.target.value)}
                rows={2}
                placeholder="Breve texto exibido na seção de ofertas..."
              />
            </label>
          </div>
        </SettingsSection>

        <div className="settings-footer">
          <FormStatus error={error} success={success} />
          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default AdminSettings
