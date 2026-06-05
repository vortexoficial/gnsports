import { getClient, isMissingTable, unwrap, unwrapMaybe } from './helpers.js'
import { DEMO_POSTS } from '../data/demoSports.js'

const DEMO_POST_BASE_DATE = Date.UTC(2026, 4, 28, 12, 0, 0)

function withDemoPostMeta(post, index = 0) {
  const publishedAt =
    post.published_at ||
    new Date(DEMO_POST_BASE_DATE - index * 24 * 60 * 60 * 1000).toISOString()

  return {
    id: `demo-${post.slug}`,
    ...post,
    published: post.published ?? true,
    published_at: publishedAt,
    created_at: publishedAt,
  }
}

function getPublishedDemoPosts(limit = 50) {
  return DEMO_POSTS
    .filter((post) => post.published !== false)
    .map(withDemoPostMeta)
    .slice(0, limit)
}

function getDemoPostBySlug(slug) {
  const index = DEMO_POSTS.findIndex((post) => post.slug === slug)
  if (index < 0) return null

  return withDemoPostMeta(DEMO_POSTS[index], index)
}

function mergeWithDemoPosts(posts, limit = 50) {
  const demos = getPublishedDemoPosts(limit)
  const demoBySlug = new Map(demos.map((post) => [post.slug, post]))
  const merged = posts.map((post) => {
    const demo = demoBySlug.get(post.slug)
    if (!demo) return post

    return {
      ...post,
      ...demo,
      id: post.id,
      created_at: post.created_at || demo.created_at,
      published_at: post.published_at || demo.published_at,
    }
  })
  const currentSlugs = new Set(merged.map((post) => post.slug))

  demos.forEach((demo) => {
    if (!currentSlugs.has(demo.slug)) merged.push(demo)
  })

  return merged.slice(0, limit)
}

function throwMissingBlogTable(error) {
  if (isMissingTable(error, 'blog_posts')) {
    throw new Error('A tabela blog_posts ainda não existe no Supabase. Rode o schema-sports.sql no SQL Editor.')
  }

  throw new Error(error.message)
}

export async function listPosts({ onlyPublished = false, limit = 50 } = {}) {
  const client = getClient()
  let query = client
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_url, published, published_at, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (onlyPublished) query = query.eq('published', true)

  const result = await query
  if (isMissingTable(result.error, 'blog_posts')) {
    return onlyPublished ? getPublishedDemoPosts(limit) : []
  }

  const posts = unwrap(result)
  return onlyPublished ? mergeWithDemoPosts(posts, limit) : posts
}

export async function getPostBySlug(slug) {
  const client = getClient()
  const result = await client.from('blog_posts').select('*').eq('slug', slug).maybeSingle()
  const demo = getDemoPostBySlug(slug)
  if (isMissingTable(result.error, 'blog_posts')) return demo

  const post = unwrapMaybe(result)
  if (!demo) return post
  if (!post) return demo

  return {
    ...post,
    ...demo,
    id: post.id,
    created_at: post.created_at || demo.created_at,
    published_at: post.published_at || demo.published_at,
  }
}

export async function getPostById(id) {
  const client = getClient()
  const result = await client.from('blog_posts').select('*').eq('id', id).maybeSingle()
  if (isMissingTable(result.error, 'blog_posts')) return null

  return unwrapMaybe(result)
}

export async function createPost(post) {
  const client = getClient()
  const result = await client.from('blog_posts').insert(post).select().single()
  if (result.error) throwMissingBlogTable(result.error)

  return result.data
}

export async function updatePost(id, post) {
  const client = getClient()
  const result = await client.from('blog_posts').update(post).eq('id', id).select().single()
  if (result.error) throwMissingBlogTable(result.error)

  return result.data
}

export async function deletePost(id) {
  const client = getClient()
  const { error } = await client.from('blog_posts').delete().eq('id', id)
  if (error) throwMissingBlogTable(error)
}
