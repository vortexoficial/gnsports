import { useState } from 'react'
import { formatCurrency } from '../utils/formatters.js'

const FALLBACK_WHATSAPP = '5522992846915'

function buildOrderMessage(product, form) {
  const price = product.promo_price || product.price
  const comp = form.complemento ? ` - ${form.complemento}` : ''

  return [
    `*INTERESSE - GN Sports*`,
    ``,
    `*Produto:* ${product.name}`,
    `*Valor anunciado:* ${formatCurrency(price)}`,
    ``,
    `*Dados para atendimento*`,
    `*Nome:* ${form.nome}`,
    `*Telefone:* ${form.telefone}`,
    ``,
    `*Localizacao para atendimento*`,
    `${form.rua}, ${form.numero}${comp}`,
    `${form.bairro} - ${form.cidade}/${form.estado.toUpperCase()}`,
    `CEP: ${form.cep}`,
    ``,
    `Olá! Gostaria de saber mais detalhes, disponibilidade, tamanhos e formas de pedido.`,
  ].join('\n')
}

function CheckoutModal({ product, whatsappNumber, onClose }) {
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  })

  const phone = String(whatsappNumber || FALLBACK_WHATSAPP).replace(/\D/g, '') || FALLBACK_WHATSAPP
  const price = product.promo_price || product.price

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const message = buildOrderMessage(product, form)
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div className="checkout-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>

        <div className="checkout-modal-header">
          <div className="checkout-modal-product">
            <span className="eyebrow">Solicitar atendimento</span>
            <h2 className="checkout-modal-title">{product.name}</h2>
            <span className="checkout-modal-price">{formatCurrency(price)}</span>
          </div>
          <button className="checkout-close" type="button" aria-label="Fechar" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit} noValidate>

          <p className="checkout-section-label">Seus dados</p>

          <div className="checkout-row">
            <label className="checkout-field">
              <span>Nome completo</span>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                placeholder="João Silva"
                autoComplete="name"
              />
            </label>
            <label className="checkout-field">
              <span>Telefone</span>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                required
                placeholder="(11) 99999-9999"
                type="tel"
                autoComplete="tel"
              />
            </label>
          </div>

          <p className="checkout-section-label">Localizacao</p>

          <div className="checkout-row checkout-row-addr">
            <label className="checkout-field checkout-field-cep">
              <span>CEP</span>
              <input
                name="cep"
                value={form.cep}
                onChange={handleChange}
                required
                placeholder="00000-000"
                maxLength={9}
                autoComplete="postal-code"
              />
            </label>
            <label className="checkout-field checkout-field-grow">
              <span>Rua / Avenida</span>
              <input
                name="rua"
                value={form.rua}
                onChange={handleChange}
                required
                placeholder="Rua das Flores"
                autoComplete="street-address"
              />
            </label>
            <label className="checkout-field checkout-field-num">
              <span>Numero</span>
              <input
                name="numero"
                value={form.numero}
                onChange={handleChange}
                required
                placeholder="123"
              />
            </label>
          </div>

          <div className="checkout-row">
            <label className="checkout-field">
              <span>Complemento <small>(opcional)</small></span>
              <input
                name="complemento"
                value={form.complemento}
                onChange={handleChange}
                placeholder="Apto 45, Bloco B..."
              />
            </label>
            <label className="checkout-field">
              <span>Bairro</span>
              <input
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
                required
                placeholder="Jardim América"
              />
            </label>
          </div>

          <div className="checkout-row">
            <label className="checkout-field checkout-field-grow">
              <span>Cidade</span>
              <input
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                required
                placeholder="São Paulo"
                autoComplete="address-level2"
              />
            </label>
            <label className="checkout-field checkout-field-uf">
              <span>Estado</span>
              <input
                name="estado"
                value={form.estado}
                onChange={handleChange}
                required
                placeholder="SP"
                maxLength={2}
                autoComplete="address-level1"
              />
            </label>
          </div>

          <button className="button checkout-submit" type="submit">
            Enviar interesse pelo WhatsApp
          </button>

        </form>
      </div>
    </div>
  )
}

export default CheckoutModal
