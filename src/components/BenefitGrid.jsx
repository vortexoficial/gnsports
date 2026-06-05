function IcoProfileSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="10" cy="8" r="3" />
      <path d="M4 19a6 6 0 0 1 9.5-4.9" />
      <circle cx="17" cy="17" r="3" />
      <path d="m19.4 19.4 2.1 2.1" />
    </svg>
  )
}

function IcoCarFront() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 13 7.2 7.8A3 3 0 0 1 10 6h4a3 3 0 0 1 2.8 1.8L19 13" />
      <path d="M4 13h16v5a1 1 0 0 1-1 1h-1.5a1.5 1.5 0 0 1-3 0h-5a1.5 1.5 0 0 1-3 0H5a1 1 0 0 1-1-1v-5Z" />
      <path d="M7 15h2" />
      <path d="M15 15h2" />
    </svg>
  )
}

function IcoClipboardCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M9 4h6" />
      <path d="M9 4a3 3 0 0 0 6 0" />
      <path d="M8 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <path d="m8 13 2.5 2.5L16 10" />
    </svg>
  )
}

function IcoFilePayment() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v5h5" />
      <path d="M8 12h8" />
      <path d="M8 16h4" />
      <path d="M15 18c1.2 0 2-.6 2-1.5S16.3 15 15 15s-2-.6-2-1.5S13.8 12 15 12" />
    </svg>
  )
}

function IcoHandshake() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M8.5 12.5 11 15a2 2 0 0 0 2.8 0l.7-.7" />
      <path d="M14 8.5 12.5 7a2 2 0 0 0-2.8 0L7 9.7" />
      <path d="m7 9.7-3-3L2 8.8l4.8 4.8" />
      <path d="m17 9.7 3-3 2 2.1-5.2 5.2" />
      <path d="M15.5 13.5 17 15a2 2 0 0 1-2.8 2.8l-.4-.4" />
      <path d="M12.5 16.5 14 18a2 2 0 0 1-2.8 2.8L9 18.6" />
    </svg>
  )
}

const benefits = [
  {
    icon: <IcoProfileSearch />,
    title: 'Busca pelo seu time',
    desc: 'A gente ajuda a encontrar clube, seleção, modelo, tamanho e estilo que combinam com o que você procura.',
  },
  {
    icon: <IcoCarFront />,
    title: 'Produtos com informação clara',
    desc: 'Camisas e itens esportivos aparecem com fotos, categoria, marca e preço para você comparar sem perder tempo.',
  },
  {
    icon: <IcoClipboardCheck />,
    title: 'Comparação orientada',
    desc: 'Você recebe ajuda para conferir tamanho, tecido, acabamento, disponibilidade e o que vale perguntar antes de pedir.',
  },
  {
    icon: <IcoFilePayment />,
    title: 'Pedido e pagamento',
    desc: 'Orientação sobre disponibilidade, envio, retirada, pagamento e próximos passos do pedido.',
  },
  {
    icon: <IcoHandshake />,
    title: 'Atendimento pelo WhatsApp',
    desc: 'Sem checkout confuso: escolha o produto, tire dúvidas e avance o pedido com atendimento direto.',
  },
]

function BenefitGrid() {
  return (
    <div className="benefit-steps">
      {benefits.map((b, i) => (
        <div key={b.title} className={`benefit-step ${i % 2 === 0 ? 'is-left' : 'is-right'}`}>
          <div className="benefit-step-card">
            <div className="benefit-step-icon">{b.icon}</div>
            <div className="benefit-step-text">
              <strong>{b.title}</strong>
              <p>{b.desc}</p>
            </div>
          </div>
          <div className="benefit-step-dot" aria-hidden="true">
            <span>{String(i + 1).padStart(2, '0')}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default BenefitGrid
