import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function getDesktopImage(banner) {
  return banner.desktop_image_url || banner.desktop_image || ''
}

function getMobileImage(banner) {
  return banner.mobile_image_url || banner.mobile_image || getDesktopImage(banner)
}

function getLocalWebpImage(url) {
  if (!url || !url.startsWith('/banners/')) return ''
  if (!/\.(jpe?g|png)$/i.test(url)) return ''
  return url.replace(/\.(jpe?g|png)$/i, '.webp')
}

function normalizeBanners(banners) {
  return (banners || [])
    .filter((b) => b.is_active !== false)
    .filter((b) => getDesktopImage(b) || getMobileImage(b))
    .sort((a, b) => Number(a.display_order || a.order || 0) - Number(b.display_order || b.order || 0))
}

function CarouselChevron({ direction }) {
  const path = direction === 'previous' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'
  return (
    <svg className="hero-banner-arrow-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  )
}

function HeroBannerCarousel({ banners = [], autoplayDelay = 5500 }) {
  const activeBanners = useMemo(() => normalizeBanners(banners), [banners])
  const n = activeBanners.length
  const hasMultiple = n > 1

  // Wrap slides: [clone-of-last, ...real, clone-of-first]
  const extendedSlides = useMemo(() => {
    if (n === 0) return []
    if (!hasMultiple) return activeBanners
    return [activeBanners[n - 1], ...activeBanners, activeBanners[0]]
  }, [activeBanners, n, hasMultiple])

  const total = extendedSlides.length

  // trackIndex: 0 = clone-last, 1..n = real, n+1 = clone-first
  const [trackIndex, setTrackIndex] = useState(hasMultiple ? 1 : 0)
  const [animated, setAnimated]     = useState(true)
  const [isPaused, setIsPaused]     = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)

  const containerRef = useRef(null)
  const dragStartX   = useRef(null)

  // Real index for bullets
  const realIndex = hasMultiple ? ((trackIndex - 1 + n) % n) : 0

  // After disabling animation for snap, re-enable on next paint
  useEffect(() => {
    if (!animated) {
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimated(true))
      )
      return () => cancelAnimationFrame(id)
    }
  }, [animated])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    function updateWidth() {
      setContainerWidth(element.offsetWidth || window.innerWidth)
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Autoplay
  useEffect(() => {
    if (!hasMultiple || isPaused) return
    const id = setInterval(() => {
      setAnimated(true)
      setTrackIndex((prev) => prev + 1)
    }, autoplayDelay)
    return () => clearInterval(id)
  }, [hasMultiple, isPaused, autoplayDelay])

  // Snap back when reaching cloned slides
  const handleTransitionEnd = useCallback(() => {
    if (trackIndex <= 0) {
      setAnimated(false)
      setTrackIndex(n)
    } else if (trackIndex >= n + 1) {
      setAnimated(false)
      setTrackIndex(1)
    }
  }, [trackIndex, n])

  // Touch drag
  function handleTouchStart(e) {
    if (!hasMultiple) return
    dragStartX.current = e.touches[0].clientX
    setIsDragging(true)
    setIsPaused(true)
  }

  function handleTouchMove(e) {
    if (!isDragging || dragStartX.current === null) return
    setDragOffset(e.touches[0].clientX - dragStartX.current)
  }

  function handleTouchEnd() {
    if (!isDragging) return
    const w = containerRef.current?.offsetWidth || window.innerWidth
    const threshold = w * 0.2

    setIsDragging(false)
    setIsPaused(false)
    setAnimated(true)

    if (dragOffset < -threshold) setTrackIndex((p) => p + 1)
    else if (dragOffset > threshold) setTrackIndex((p) => p - 1)

    setDragOffset(0)
    dragStartX.current = null
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft')  { setAnimated(true); setTrackIndex((p) => p - 1) }
    if (e.key === 'ArrowRight') { setAnimated(true); setTrackIndex((p) => p + 1) }
  }

  if (!activeBanners.length) return null

  // Track transform: percentage of total track width
  const basePercent = -(trackIndex / total) * 100
  const dragPercent = isDragging && containerWidth > 0 ? (dragOffset / (containerWidth * total)) * 100 : 0

  const trackStyle = {
    display: 'flex',
    width: `${total * 100}%`,
    height: '100%',
    transform: `translateX(${basePercent + dragPercent}%)`,
    transition: isDragging ? 'none' : animated ? 'transform 580ms cubic-bezier(.25,.8,.25,1)' : 'none',
    willChange: 'transform',
  }

  return (
    <section
      className="hero-banner hero-banner-carousel image-only"
      ref={containerRef}
      aria-label="Banners principais"
      aria-roledescription="carousel"
      tabIndex="0"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-banner-viewport">
        <div
          className="hero-banner-track"
          style={trackStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedSlides.map((banner, index) => {
            const desktopImage = getDesktopImage(banner)
            const mobileImage  = getMobileImage(banner)
            const desktopWebp  = getLocalWebpImage(desktopImage)
            const mobileWebp   = getLocalWebpImage(mobileImage)
            const title        = banner.title || `Banner ${index + 1}`

            return (
              <article
                key={`${banner.id}-${index}`}
                className="hero-banner-slide"
                aria-hidden={index !== trackIndex}
                style={{ width: `${100 / total}%`, flex: `0 0 ${100 / total}%` }}
              >
                <picture>
                  {mobileWebp ? (
                    <source type="image/webp" media="(max-width: 767px)" srcSet={mobileWebp} />
                  ) : null}
                  <source media="(max-width: 767px)" srcSet={mobileImage} />
                  {desktopWebp ? (
                    <source type="image/webp" media="(min-width: 768px)" srcSet={desktopWebp} />
                  ) : null}
                  <source media="(min-width: 768px)" srcSet={desktopImage || mobileImage} />
                  <img
                    src={desktopImage || mobileImage}
                    alt={title}
                    loading={index <= 1 ? 'eager' : 'lazy'}
                    fetchPriority={index === 1 ? 'high' : 'auto'}
                    decoding="async"
                    style={{
                      '--desktop-position': banner.desktop_position || 'center center',
                      '--mobile-position':  banner.mobile_position  || 'center center',
                    }}
                  />
                </picture>
              </article>
            )
          })}
        </div>

        {hasMultiple ? (
          <>
          <button
            className="hero-banner-arrow previous"
            type="button"
            aria-label="Banner anterior"
            onClick={() => { setAnimated(true); setTrackIndex((p) => p - 1) }}
          >
            <CarouselChevron direction="previous" />
          </button>
          <button
            className="hero-banner-arrow next"
            type="button"
            aria-label="Próximo banner"
            onClick={() => { setAnimated(true); setTrackIndex((p) => p + 1) }}
          >
            <CarouselChevron direction="next" />
          </button>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
          <div className="hero-banner-bullets" role="tablist" aria-label="Selecionar banner">
            {activeBanners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                role="tab"
                aria-selected={index === realIndex}
                aria-label={`Ir para banner ${index + 1}`}
                className={index === realIndex ? 'active' : ''}
                onClick={() => { setAnimated(true); setTrackIndex(index + 1) }}
              />
            ))}
          </div>
      ) : null}
    </section>
  )
}

export default HeroBannerCarousel
