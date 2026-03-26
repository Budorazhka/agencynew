import { useState, type CSSProperties, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Newspaper, Trash2 } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { useNewsFeed } from '@/context/NewsFeedContext'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
}

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(0,17,13,0.45)',
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 13,
  color: C.white,
  fontFamily: 'inherit',
  outline: 'none',
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: C.gold,
  marginBottom: 6,
}

export default function NewsManagementSettingsPage() {
  const { customArticles, addArticle, removeArticle } = useNewsFeed()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  function handlePublish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    addArticle({
      title: title.trim(),
      body: body.trim(),
      linkUrl: linkUrl.trim() || undefined,
      linkLabel: linkLabel.trim() || undefined,
    })
    setTitle('')
    setBody('')
    setLinkUrl('')
    setLinkLabel('')
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2000)
  }

  return (
    <DashboardShell
      topBack={{ label: 'Новости и рассылки', route: '/dashboard/settings/news-mailings' }}
    >
      <div style={{ padding: '24px 28px 48px', maxWidth: 720 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 4 }}>Управление новостями</div>
          <div style={{ fontSize: 12, color: C.whiteLow }}>
            Публикация сразу попадает в раздел «Новости» у всех сотрудников. Данные хранятся в браузере (демо).
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <Link
            to="/dashboard/info/news"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              color: C.gold,
            }}
          >
            <Newspaper size={14} />
            Открыть ленту новостей
          </Link>
        </div>

        <form
          onSubmit={handlePublish}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px', marginBottom: 24 }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, marginBottom: 16 }}>
            Новая новость
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Заголовок</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Краткий заголовок"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Текст новости</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Полный текст…"
              required
              rows={6}
              style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 120, lineHeight: 1.5 }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Ссылка (необязательно)</label>
            <input
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="https://… или site.ru/page"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Подпись к ссылке (необязательно)</label>
            <input
              value={linkLabel}
              onChange={e => setLinkLabel(e.target.value)}
              placeholder="Например: Регламент в Confluence"
              style={inputStyle}
            />
            <p style={{ margin: '8px 0 0', fontSize: 10, color: C.whiteLow }}>
              Если ссылка есть, а подпись пустая — покажется «Подробнее».
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="submit"
              style={{
                padding: '10px 22px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                background: 'rgba(201,168,76,0.25)',
                color: C.gold,
                borderBottom: '2px solid var(--gold)',
              }}
            >
              Опубликовать
            </button>
            {savedFlash && (
              <span style={{ fontSize: 12, color: '#4ade80' }}>Добавлено в ленту</span>
            )}
          </div>
        </form>

        {customArticles.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div
              style={{
                padding: '12px 18px',
                borderBottom: `1px solid ${C.border}`,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: C.whiteLow,
              }}
            >
              Ваши публикации ({customArticles.length})
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {customArticles.map((a) => (
                <li
                  key={a.id}
                  style={{
                    padding: '14px 18px',
                    borderBottom: `1px solid rgba(255,255,255,0.06)`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.white }}>
                      {a.emoji} {a.title}
                    </div>
                    <div style={{ fontSize: 11, color: C.whiteLow, marginTop: 4, lineHeight: 1.4 }}>
                      {a.body.length > 120 ? `${a.body.slice(0, 120)}…` : a.body}
                    </div>
                    <div style={{ fontSize: 10, color: C.whiteLow, marginTop: 6 }}>
                      {new Date(a.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}
                      {a.author}
                      {a.linkUrl && ` · ${a.linkLabel ?? 'ссылка'}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Удалить из ленты"
                    onClick={() => removeArticle(a.id)}
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: `1px solid rgba(248,113,113,0.35)`,
                      background: 'rgba(248,113,113,0.08)',
                      color: '#f87171',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
