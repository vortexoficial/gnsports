import { env } from '../config/env.js'
import { slugify } from '../utils/slug.js'
import { getClient, unwrap } from './helpers.js'

function canConvertToWebp(file) {
  return (
    file?.type?.startsWith('image/') &&
    file.type !== 'image/svg+xml' &&
    file.type !== 'image/webp' &&
    typeof document !== 'undefined'
  )
}

function loadLocalImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível otimizar a imagem.'))
    }
    image.src = url
  })
}

async function convertImageToWebp(file, options = {}) {
  if (!canConvertToWebp(file)) return file

  const image = await loadLocalImage(file)
  const maxWidth = Number(options.maxWidth || 0)
  const maxHeight = Number(options.maxHeight || 0)
  const scale = Math.min(
    maxWidth ? maxWidth / image.naturalWidth : 1,
    maxHeight ? maxHeight / image.naturalHeight : 1,
    1,
  )
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) return file

  canvas.width = width
  canvas.height = height
  context.drawImage(image, 0, 0, width, height)

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/webp', options.quality || 0.82),
  )

  if (!blob || blob.size >= file.size) return file

  const baseName = file.name.replace(/\.[^/.]+$/, '') || 'imagem'
  return new File([blob], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: file.lastModified,
  })
}

export async function uploadStoreImage(file, folder = 'products', options = {}) {
  if (!file) return ''

  const client = getClient()
  const uploadFile = options.convertToWebp
    ? await convertImageToWebp(file, options)
    : file
  const extension = uploadFile.name.split('.').pop()
  const baseName = slugify(uploadFile.name.replace(/\.[^/.]+$/, '')) || 'imagem'
  const path = `${folder}/${Date.now()}-${baseName}.${extension}`

  unwrap(
    await client.storage.from(env.productImageBucket).upload(path, uploadFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: uploadFile.type || undefined,
    }),
  )

  const {
    data: { publicUrl },
  } = client.storage.from(env.productImageBucket).getPublicUrl(path)

  return publicUrl
}
