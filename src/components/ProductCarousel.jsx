import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import ProductCard from './ProductCard.jsx'

const GAP = 14

function ChevronIcon({ direction }) {
  const path = direction === 'previous' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  )
}

function getPerPage(width) {
  if (width >= 1100) return 5
  if (width >= 860)  return 4
  if (width >= 640)  return 3
  if (width >= 480)  return 2
  return 1
}

function ProductCarousel({ products = [], whatsappNumber = '' }) {
  const viewportRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [perPage, setPerPage] = useState(5)

  const measureViewport = useCallback(() => {
    const el = viewportRef.current
    if (!el) return 0

    const nextWidth = Math.floor(el.getBoundingClientRect().width || el.offsetWidth || 0)
    if (nextWidth > 0) {
      setContainerWidth(nextWidth)
      setPerPage(getPerPage(nextWidth))
    }

    return nextWidth
  }, [])

  // Measure on mount, when products arrive, and whenever the carousel resizes.
  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return undefined

    measureViewport()
    const frame = requestAnimationFrame(measureViewport)
    const timer = window.setTimeout(measureViewport, 120)

    const handleResize = () => measureViewport()
    window.addEventListener('resize', handleResize)

    let observer
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measureViewport)
      observer.observe(el)
    }

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
      observer?.disconnect()
    }
  }, [measureViewport, products.length])

  const n = products.length
  const needsLoop = n > perPage

  const extended = useMemo(() => {
    if (!needsLoop || n === 0) return products
    return [
      ...products.slice(-perPage),
      ...products,
      ...products.slice(0, perPage),
    ]
  }, [products, perPage, needsLoop, n])

  const [trackIndex, setTrackIndex] = useState(perPage)
  const [animated, setAnimated] = useState(false)

  // Reset position when perPage changes (e.g. window resize)
  useEffect(() => {
    setAnimated(false)
    setTrackIndex(needsLoop ? perPage : 0)
  }, [perPage, needsLoop])

  // Re-enable animation after silent snap
  useEffect(() => {
    if (!animated) {
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimated(true))
      )
      return () => cancelAnimationFrame(id)
    }
  }, [animated])

  const handleTransitionEnd = useCallback(() => {
    if (!needsLoop) return
    if (trackIndex < perPage) {
      setAnimated(false)
      setTrackIndex(trackIndex + n)
    } else if (trackIndex >= perPage + n) {
      setAnimated(false)
      setTrackIndex(trackIndex - n)
    }
  }, [trackIndex, perPage, n, needsLoop])

  const fallbackWidth = typeof window !== 'undefined'
    ? Math.min(Math.max(window.innerWidth - 32, 260), 1180)
    : 1180
  const effectiveWidth = containerWidth || fallbackWidth
  const itemWidth = (effectiveWidth - (perPage - 1) * GAP) / perPage

  const offset = -(trackIndex * (itemWidth + GAP))

  const trackStyle = {
    display: 'flex',
    gap: `${GAP}px`,
    transform: `translateX(${offset}px)`,
    transition: animated ? 'transform 480ms cubic-bezier(.25,.8,.25,1)' : 'none',
    willChange: 'transform',
  }

  if (!products.length) return null

  return (
    <div className="product-carousel">
      {n > 1 ? (
        <div className="product-carousel-controls" aria-label="Navegar produtos">
          <button
            className="product-carousel-control previous"
            type="button"
            aria-label="Produtos anteriores"
            onClick={() => { setAnimated(true); setTrackIndex(p => p - perPage) }}
          >
            <ChevronIcon direction="previous" />
          </button>
          <button
            className="product-carousel-control next"
            type="button"
            aria-label="Próximos produtos"
            onClick={() => { setAnimated(true); setTrackIndex(p => p + perPage) }}
          >
            <ChevronIcon direction="next" />
          </button>
        </div>
      ) : null}

      <div className="product-carousel-viewport" ref={viewportRef}>
        <div
          className="product-carousel-track"
          style={trackStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          {extended.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="product-carousel-item"
              style={{ width: `${itemWidth}px`, flexShrink: 0 }}
            >
              <ProductCard product={product} whatsappNumber={whatsappNumber} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductCarousel
