import { useEffect, useMemo, useState } from 'react'
import { getWebpImageSrc } from '../utils/images.js'

function OptimizedImage({ src, alt = '', onError, ...props }) {
  const webpSrc = useMemo(() => getWebpImageSrc(src), [src])
  const preferredSrc = !import.meta.env.DEV && webpSrc ? webpSrc : src
  const [currentSrc, setCurrentSrc] = useState(preferredSrc)

  useEffect(() => {
    setCurrentSrc(preferredSrc)
  }, [preferredSrc])

  if (!src) return null

  function handleError(event) {
    if (currentSrc !== src) {
      setCurrentSrc(src)
      return
    }

    onError?.(event)
  }

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  )
}

export default OptimizedImage
