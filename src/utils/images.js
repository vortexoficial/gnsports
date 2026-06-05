const LOCAL_RASTER_RE = /\.(png|jpe?g)([?#].*)?$/i

export function getWebpImageSrc(src) {
  if (!src || typeof src !== 'string') return ''
  if (/^(https?:|data:|blob:)/i.test(src)) return ''
  if (!LOCAL_RASTER_RE.test(src)) return ''

  return src.replace(/\.(png|jpe?g)([?#].*)?$/i, '.webp$2')
}
