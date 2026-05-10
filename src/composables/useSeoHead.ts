const SITE_NAME = 'Pokédex'
const DEFAULT_DESCRIPTION =
  'Explore every Pokémon across every generation. Search, filter by type, build teams, and play Who\'s That Pokémon.'

const BASE_URL =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}${import.meta.env.BASE_URL.replace(/\/$/, '')}`
    : ''

function ensureMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function ensureProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeProperty(property: string) {
  const el = document.querySelector(`meta[property="${property}"]`)
  if (el) el.remove()
}

function setCanonical(path: string) {
  document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove())
  const link = document.createElement('link')
  link.setAttribute('rel', 'canonical')
  link.setAttribute('href', `${BASE_URL}${path}`)
  document.head.appendChild(link)
}

function setJsonLd(id: string, data: Record<string, unknown>) {
  removeJsonLd(id)
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = id
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

function removeJsonLd(id: string) {
  const existing = document.getElementById(id)
  if (existing) existing.remove()
}

export interface SeoHeadOptions {
  title: string
  description?: string
  canonicalPath: string
  robots?: string
  ogImage?: string
  jsonLd?: { id: string; data: Record<string, unknown> }
}

export function updateSeoHead(options: SeoHeadOptions) {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    canonicalPath,
    robots = 'index, follow',
    ogImage,
    jsonLd,
  } = options

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  document.title = fullTitle

  ensureMeta('description', description)
  ensureMeta('robots', robots)
  ensureProperty('og:title', fullTitle)
  ensureProperty('og:description', description)
  ensureProperty('og:type', 'website')
  ensureProperty('og:url', `${BASE_URL}${canonicalPath}`)

  if (ogImage) {
    ensureProperty('og:image', ogImage)
  } else {
    removeProperty('og:image')
  }

  setCanonical(canonicalPath)

  if (jsonLd) {
    setJsonLd(jsonLd.id, jsonLd.data)
  } else {
    removeJsonLd('jsonld-website')
    removeJsonLd('jsonld-product')
  }
}
