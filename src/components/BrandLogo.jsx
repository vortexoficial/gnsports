function BrandLogo({ compact = false }) {
  return (
    <span className={compact ? 'brand-logo compact' : 'brand-logo'} aria-hidden="true">
      <img src="/logo.png" alt="" />
    </span>
  )
}

export default BrandLogo
