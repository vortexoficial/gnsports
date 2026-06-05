import { slugify } from '../utils/slug.js'
import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  LEGACY_DEMO_CATEGORY_SLUGS,
  LEGACY_DEMO_PRODUCT_SLUGS,
} from '../data/demoSports.js'
import { getClient, isMissingColumn, unwrap, unwrapMaybe } from './helpers.js'

const PRODUCT_SELECT = `
  *,
  category:categories(*),
  variants:product_variants(*)
`

function normalizeProduct(product) {
  if (!product) return product
  return {
    ...product,
    is_active: product.is_active ?? true,
    is_featured: product.is_featured ?? false,
    gallery_urls: product.gallery_urls || [],
    objective_tags: product.objective_tags || [],
    subcategory: product.subcategory || '',
  }
}

function applyProductFilters(query, {
  onlyActive = false,
  featured = false,
  categoryId = '',
  type = '',
  search = '',
  limit,
} = {}, ignoredColumns = []) {
  if (onlyActive && !ignoredColumns.includes('is_active')) {
    query = query.eq('is_active', true)
  }
  if (featured && !ignoredColumns.includes('is_featured')) {
    query = query.eq('is_featured', true)
  }
  if (categoryId) query = query.eq('category_id', categoryId)
  if (type) query = query.eq('type', type)
  if (search) {
    const term = `%${search}%`
    query = query.or(`name.ilike.${term},brand.ilike.${term}`)
  }
  if (limit) query = query.limit(limit)

  return query
}

export async function listProducts({
  onlyActive = false,
  featured = false,
  categoryId = '',
  type = '',
  search = '',
  limit,
} = {}) {
  const client = getClient()
  const options = { onlyActive, featured, categoryId, type, search, limit }
  const baseQuery = () => client
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })

  let result = await applyProductFilters(baseQuery(), options)
  const ignoredColumns = []

  if (isMissingColumn(result.error, 'is_active')) {
    ignoredColumns.push('is_active')
    result = await applyProductFilters(baseQuery(), options, ignoredColumns)
  }

  if (isMissingColumn(result.error, 'is_featured')) {
    ignoredColumns.push('is_featured')
    result = await applyProductFilters(baseQuery(), options, ignoredColumns)
  }

  return unwrap(result).map(normalizeProduct)
}

export async function createDemoProductBase() {
  const client = getClient()
  const now = new Date().toISOString()
  if (LEGACY_DEMO_CATEGORY_SLUGS.length) {
    await client
      .from('categories')
      .update({ is_active: false })
      .in('slug', LEGACY_DEMO_CATEGORY_SLUGS)
  }
  if (LEGACY_DEMO_PRODUCT_SLUGS.length) {
    await client
      .from('products')
      .update({ is_active: false, updated_at: now })
      .in('slug', LEGACY_DEMO_PRODUCT_SLUGS)
  }

  const categories = unwrap(
    await client
      .from('categories')
      .upsert(
        DEMO_CATEGORIES.map((category) => ({
          ...category,
          is_active: true,
        })),
        { onConflict: 'slug' },
      )
      .select('*'),
  )
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]))

  const products = DEMO_PRODUCTS.map(({ categorySlug, ...product }) => ({
    ...product,
    category_id: categoryBySlug.get(categorySlug)?.id || null,
    gallery_urls: product.gallery_urls || [],
    is_active: product.is_active ?? true,
    is_featured: product.is_featured ?? true,
    created_at: now,
    updated_at: now,
  }))

  let result = await client
    .from('products')
    .upsert(products, { onConflict: 'slug' })
    .select('*, category:categories(*)')

  if (isMissingColumn(result.error, 'subcategory')) {
    const productsWithoutSubcategory = products.map((product) => {
      const fallbackProduct = { ...product }
      delete fallbackProduct.subcategory
      return fallbackProduct
    })
    result = await client
      .from('products')
      .upsert(productsWithoutSubcategory, { onConflict: 'slug' })
      .select('*, category:categories(*)')
  }

  return unwrap(result).map(normalizeProduct)
}

export async function getProductBySlug(slug) {
  const client = getClient()

  return normalizeProduct(unwrapMaybe(
    await client.from('products').select(PRODUCT_SELECT).eq('slug', slug).maybeSingle(),
  ))
}

export async function getProductById(id) {
  const client = getClient()

  return normalizeProduct(unwrapMaybe(
    await client.from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle(),
  ))
}

export async function saveProductWithVariants(product, variants = []) {
  const client = getClient()
  const payload = {
    name: product.name,
    slug: product.slug || slugify(product.name),
    type: product.type,
    category_id: product.category_id || null,
    subcategory: product.subcategory || '',
    description: product.description || '',
    brand: product.brand || '',
    price: Number(product.price || 0),
    promo_price: product.promo_price ? Number(product.promo_price) : null,
    stock: Number(product.stock || 0),
    image_url: product.image_url || null,
    gallery_urls: product.gallery_urls || [],
    is_active: Boolean(product.is_active),
    is_featured: Boolean(product.is_featured),
    objective_tags: product.objective_tags || [],
    updated_at: new Date().toISOString(),
  }

  let saveResult = product.id
    ? await client
        .from('products')
        .update(payload)
        .eq('id', product.id)
        .select()
        .single()
    : await client
        .from('products')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select()
        .single()

  if (isMissingColumn(saveResult.error, 'subcategory')) {
    const fallbackPayload = { ...payload }
    delete fallbackPayload.subcategory
    saveResult = product.id
      ? await client
          .from('products')
          .update(fallbackPayload)
          .eq('id', product.id)
          .select()
          .single()
      : await client
          .from('products')
          .insert({ ...fallbackPayload, created_at: new Date().toISOString() })
          .select()
          .single()
  }

  const savedProduct = unwrap(saveResult)

  await client.from('product_variants').delete().eq('product_id', savedProduct.id)

  const cleanVariants = variants
    .filter((variant) => variant.name)
    .map((variant) => ({
      product_id: savedProduct.id,
      variant_type: variant.variant_type,
      name: variant.name,
      stock: Number(variant.stock || 0),
      price_adjustment: Number(variant.price_adjustment || 0),
    }))

  if (cleanVariants.length) {
    unwrap(await client.from('product_variants').insert(cleanVariants))
  }

  return savedProduct
}

export async function toggleProductField(id, field, value) {
  const client = getClient()
  return unwrap(
    await client
      .from('products')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
  )
}

export async function deleteProduct(id) {
  const client = getClient()
  await client.from('product_variants').delete().eq('product_id', id)
  return unwrap(await client.from('products').delete().eq('id', id))
}
