import { access, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(process.argv[2] || 'dist')
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png'])

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function collectImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectImages(entryPath))
      continue
    }

    const extension = path.extname(entry.name).toLowerCase()
    if (entry.isFile() && supportedExtensions.has(extension)) {
      files.push(entryPath)
    }
  }

  return files
}

async function generateWebp() {
  if (!(await exists(root))) {
    console.warn(`[webp] Pasta nao encontrada: ${root}`)
    return
  }

  const images = await collectImages(root)
  let converted = 0

  for (const imagePath of images) {
    const outputPath = imagePath.replace(/\.(jpe?g|png)$/i, '.webp')
    if (await exists(outputPath)) continue

    await sharp(imagePath)
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toFile(outputPath)

    converted += 1
  }

  console.log(`[webp] ${converted} imagem(ns) convertida(s) em ${root}`)
}

generateWebp().catch((error) => {
  console.error('[webp] Falha ao gerar imagens WebP.')
  console.error(error)
  process.exit(1)
})
