import OptimizedImage from './OptimizedImage.jsx'

function BrandLogo({ compact = false }) {
  return (
    <span className={compact ? 'brand-logo compact' : 'brand-logo'} aria-hidden="true">
      <OptimizedImage src="/logo.webp" alt="" decoding="async" />
    </span>
  )
}

export default BrandLogo
