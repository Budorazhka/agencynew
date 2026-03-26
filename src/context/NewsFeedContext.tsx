import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { NEWS_MOCK, type NewsArticle } from '@/data/info-mock'

const STORAGE_KEY = 'agency-custom-news-v1'

function loadStored(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is NewsArticle =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as NewsArticle).id === 'string' &&
        typeof (x as NewsArticle).title === 'string',
    )
  } catch {
    return []
  }
}

function saveStored(articles: NewsArticle[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
  } catch {
    /* ignore quota */
  }
}

function normalizeUrl(url: string): string | undefined {
  const t = url.trim()
  if (!t) return undefined
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('//')) return `https:${t}`
  return `https://${t}`
}

export type AddNewsInput = {
  title: string
  body: string
  linkUrl?: string
  linkLabel?: string
}

type NewsFeedContextValue = {
  customArticles: NewsArticle[]
  allArticles: NewsArticle[]
  addArticle: (input: AddNewsInput) => void
  removeArticle: (id: string) => void
}

const NewsFeedContext = createContext<NewsFeedContextValue | null>(null)

export function NewsFeedProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [customArticles, setCustomArticles] = useState<NewsArticle[]>(() =>
    typeof window !== 'undefined' ? loadStored() : [],
  )

  useEffect(() => {
    setCustomArticles(loadStored())
  }, [])

  useEffect(() => {
    saveStored(customArticles)
  }, [customArticles])

  const addArticle = useCallback(
    (input: AddNewsInput) => {
      const title = input.title.trim()
      const body = input.body.trim()
      if (!title || !body) return

      const linkUrl = input.linkUrl?.trim() ? normalizeUrl(input.linkUrl) : undefined
      const linkLabel = input.linkLabel?.trim() || (linkUrl ? 'Подробнее' : undefined)

      const article: NewsArticle = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title,
        body,
        category: 'company',
        author: currentUser?.name ?? 'Агентство',
        publishedAt: new Date().toISOString().split('T')[0],
        emoji: '📢',
        pinned: false,
        linkUrl,
        linkLabel,
      }

      setCustomArticles((prev) => [article, ...prev])
    },
    [currentUser?.name],
  )

  const removeArticle = useCallback((id: string) => {
    if (!id.startsWith('custom-')) return
    setCustomArticles((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const allArticles = useMemo(() => {
    const byId = new Map<string, NewsArticle>()
    for (const a of NEWS_MOCK) byId.set(a.id, a)
    for (const a of customArticles) byId.set(a.id, a)
    return [...byId.values()].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
  }, [customArticles])

  const value = useMemo(
    () => ({
      customArticles,
      allArticles,
      addArticle,
      removeArticle,
    }),
    [customArticles, allArticles, addArticle, removeArticle],
  )

  return <NewsFeedContext.Provider value={value}>{children}</NewsFeedContext.Provider>
}

export function useNewsFeed() {
  const ctx = useContext(NewsFeedContext)
  if (!ctx) throw new Error('useNewsFeed must be used within NewsFeedProvider')
  return ctx
}
