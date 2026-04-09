import { useMemo, useState } from 'react'
import { ExternalLink, Pin, Search } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { useNewsFeed } from '@/context/NewsFeedContext'
import type { NewsArticle, NewsCategory } from '@/data/info-mock'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
}

const CATEGORY_META: Record<NewsCategory, { label: string; color: string }> = {
  company:    { label: 'Компания',      color: '#c9a84c' },
  market:     { label: 'Рынок',         color: '#60a5fa' },
  developer:  { label: 'Застройщики',   color: '#4ade80' },
  regulation: { label: 'Законодательство', color: '#f87171' },
}

type CategoryFilter = NewsCategory | 'all'

const FILTER_TABS: { key: CategoryFilter; label: string }[] = [
  { key: 'all',        label: 'Все' },
  { key: 'company',    label: 'Компания' },
  { key: 'market',     label: 'Рынок' },
  { key: 'developer',  label: 'Застройщики' },
  { key: 'regulation', label: 'Законодательство' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function NewsPage() {
  const { allArticles } = useNewsFeed()
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [sort, setSort] = useState<'new' | 'old'>('new')

  const articles = useMemo(
    () =>
      allArticles.filter((a) => {
        const matchCat = filter === 'all' || a.category === filter
        const q = search.trim().toLowerCase()
        const matchQ = !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
        return matchCat && matchQ
      }),
    [allArticles, filter, search],
  )

  const sortedArticles = useMemo(() => {
    const list = [...articles]
    list.sort((x, y) =>
      sort === 'new' ? y.publishedAt.localeCompare(x.publishedAt) : x.publishedAt.localeCompare(y.publishedAt),
    )
    return list
  }, [articles, sort])

  const pinned = sortedArticles.filter((a) => a.pinned)
  const regular = sortedArticles.filter((a) => !a.pinned)

  const kpi = useMemo(
    () => ({
      total: articles.length,
      pinned: articles.filter((a) => a.pinned).length,
      withLink: articles.filter((a) => !!a.linkUrl).length,
      cats: new Set(articles.map((a) => a.category)).size,
    }),
    [articles],
  )

  return (
    <DashboardShell>
      <div style={{ padding: '24px 28px 48px', maxWidth: 900 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 4 }}>Новости и обновления</div>
          <div style={{ fontSize: 12, color: C.whiteLow }}>Корпоративные новости, изменения рынка и регламентов</div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">В выдаче</p>
            <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.total}</p>
          </div>
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Закреплено</p>
            <p className="text-xl font-bold text-[color:var(--gold)]">{kpi.pinned}</p>
          </div>
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">С внешней ссылкой</p>
            <p className="text-xl font-bold text-blue-300">{kpi.withLink}</p>
          </div>
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Категорий</p>
            <p className="text-xl font-bold text-emerald-300">{kpi.cats}</p>
          </div>
        </div>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0 12px', height: 34, flex: 1, minWidth: 200, maxWidth: 300 }}>
            <Search size={12} color={C.whiteLow} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по заголовку и тексту..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: C.whiteMid, fontFamily: 'inherit' }}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'new' | 'old')}
            className="h-[34px] rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] px-2 text-xs text-[color:var(--workspace-text)]"
          >
            <option value="new">Сначала новые</option>
            <option value="old">Сначала старые</option>
          </select>
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {FILTER_TABS.map(t => (
              <button key={t.key} onClick={() => setFilter(t.key)} style={{
                padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: filter === t.key ? 700 : 400,
                background: filter === t.key ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: filter === t.key ? C.gold : C.whiteLow,
                borderBottom: filter === t.key ? '2px solid var(--gold)' : '2px solid transparent',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Pinned */}
        {pinned.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Pin size={10} /> Закреплённые
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pinned.map(a => <ArticleCard key={a.id} article={a} expanded={expanded === a.id} onToggle={() => setExpanded(expanded === a.id ? null : a.id)} pinned />)}
            </div>
          </div>
        )}

        {/* Regular */}
        {regular.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {regular.map(a => <ArticleCard key={a.id} article={a} expanded={expanded === a.id} onToggle={() => setExpanded(expanded === a.id ? null : a.id)} />)}
          </div>
        )}

        {articles.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center', color: C.whiteLow, fontSize: 13 }}>Ничего не найдено</div>
        )}
      </div>
    </DashboardShell>
  )
}

function ArticleCard({ article, expanded, onToggle, pinned }: {
  article: NewsArticle
  expanded: boolean
  onToggle: () => void
  pinned?: boolean
}) {
  const meta = CATEGORY_META[article.category]
  return (
    <div
      onClick={onToggle}
      style={{
        background: pinned ? `${meta.color}06` : C.card,
        border: `1px solid ${pinned ? `${meta.color}33` : C.border}`,
        borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { if (!pinned) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
      onMouseLeave={e => { if (!pinned) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--green-border)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ fontSize: 24, flexShrink: 0, lineHeight: 1, marginTop: 2 }}>{article.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{article.title}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 20, background: `${meta.color}18`, border: `1px solid ${meta.color}44`, color: meta.color }}>
              {meta.label}
            </span>
            <span style={{ fontSize: 10, color: C.whiteLow }}>{formatDate(article.publishedAt)}</span>
            <span style={{ fontSize: 10, color: C.whiteLow }}>· {article.author}</span>
          </div>
          {expanded && (
            <div style={{ marginTop: 12, fontSize: 13, color: C.whiteMid, lineHeight: 1.7, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{article.body}</p>
              {article.linkUrl && (
                <a
                  href={article.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.gold,
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={14} />
                  {article.linkLabel ?? 'Ссылка'}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
