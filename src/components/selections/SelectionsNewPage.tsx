import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelectionsBasePath, useSelectionsMarket } from '@/hooks/useSelectionsBasePath'
import { Building2, Home, Send, Trash2, Users, X } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { cn } from '@/lib/utils'
import { useAgencyBranding } from '@/hooks/useAgencyBranding'
import { useAuth } from '@/context/AuthContext'
import { useLeads } from '@/context/LeadsContext'
import { mockPhoneForLead } from '@/lib/lead-contact-mock'
import { prependSelections } from '@/lib/selections-storage'
import {
  PRIMARY_COMPLEXES_MOCK,
  SECONDARY_LOTS_MOCK,
  type PrimaryComplex,
  type PrimaryLot,
  type SecondaryLot,
} from '@/data/selection-catalog-mock'
import { MARKET_COLORS, type Selection, type SelectionProperty } from '@/types/selections'
import { LEAD_STAGE_COLUMN } from '@/data/leads-mock'
import { FMT_USD } from '@/lib/format-currency'

type BasketPrimary = { kind: 'primary'; key: string; complex: PrimaryComplex; lot: PrimaryLot }
type BasketSecondary = { kind: 'secondary'; key: string; lot: SecondaryLot }
type BasketItem = BasketPrimary | BasketSecondary

function formatPriceUsd(n: number) {
  return FMT_USD.format(n)
}

function basketToSelectionProperties(items: BasketItem[]): SelectionProperty[] {
  return items.map((item) => {
    if (item.kind === 'primary') {
      const { complex, lot } = item
      return {
        id: item.key,
        propertyId: lot.id,
        address: `${complex.address}, ${lot.label}`,
        price: lot.price,
        rooms: lot.rooms,
        area: lot.area,
        floor: lot.floor,
        market: 'primary',
        building: complex.name,
        developer: complex.developer,
        imageUrl: lot.imageUrl,
        description: lot.description,
      }
    }
    const { lot } = item
    return {
      id: item.key,
      propertyId: lot.propertyId,
      address: lot.address,
      price: lot.price,
      rooms: lot.rooms,
      area: lot.area,
      floor: lot.floor,
      market: 'secondary',
      imageUrl: lot.imageUrl,
      description: lot.description,
    }
  })
}

function newSelId() {
  return `sel-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function SelectionSendPreview({
  title,
  recipientLabel,
  basket,
  agencyName,
  logoDataUrl,
}: {
  title: string
  recipientLabel: string
  basket: BasketItem[]
  agencyName: string
  logoDataUrl: string | null
}) {
  return (
    <div
      className="rounded-xl border border-[color:var(--hub-card-border)] bg-[var(--hub-card-bg)] text-[color:var(--app-text)] shadow-[inset_0_0_0_1px_var(--hub-card-border)]"
      style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
    >
      <div className="border-b border-[color:var(--divider-subtle)] px-6 py-5">
        {logoDataUrl ? (
          <img src={logoDataUrl} alt="" className="max-h-14 max-w-[200px] object-contain object-left" />
        ) : (
          <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--hub-desc)]">Логотип агентства</div>
        )}
        <h2 className="mt-4 text-lg font-bold text-[color:var(--app-text)]">{title || 'Подборка объектов'}</h2>
        <p className="mt-1 text-sm text-[color:var(--hub-body)]">Для: {recipientLabel || '— выберите получателей из лидов'}</p>
      </div>

      <div className="space-y-0 px-6 py-4">
        {basket.length === 0 ? (
          <p className="py-8 text-center text-sm text-[color:var(--app-text-muted)]">Добавьте лоты из первички или вторички</p>
        ) : (
          basket.map((item, i) => (
            <div key={item.key}>
              {i > 0 && <div className="my-6 border-t-2 border-dashed border-[color:var(--divider-subtle)]" aria-hidden />}
              {item.kind === 'primary' ? (
                <PrimaryLotPreview complex={item.complex} lot={item.lot} index={i + 1} />
              ) : (
                <SecondaryLotPreview lot={item.lot} index={i + 1} />
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[color:var(--divider-subtle)] bg-[var(--green-deep)] px-6 py-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--hub-desc)]">
          {agencyName || 'Название агентства'}
        </p>
        <p className="mt-1 text-[11px] text-[color:var(--app-text-subtle)]">Подборка сформирована в системе агентства</p>
      </div>
    </div>
  )
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[color:var(--divider-subtle)] py-1.5 text-sm last:border-0">
      <span className="text-[color:var(--hub-body)]">{label}</span>
      <span className="text-right font-medium text-[color:var(--app-text)]">{value}</span>
    </div>
  )
}

function PrimaryLotPreview({ complex, lot, index }: { complex: PrimaryComplex; lot: PrimaryLot; index: number }) {
  return (
    <article className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--hub-tile-icon-bg)] text-xs font-bold text-[color:var(--gold)]">
          {index}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)]">Новостройка</p>
          <h3 className="text-base font-bold text-[color:var(--app-text)]">{complex.name}</h3>
          <p className="text-sm text-[color:var(--hub-body)]">{lot.label}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-[color:var(--green-border)] bg-[var(--green-card)]">
        <img src={lot.imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
      </div>
      <p className="text-sm leading-relaxed text-[color:var(--hub-body)]">{lot.description}</p>
      <div className="rounded-lg bg-[var(--green-card)] p-3 ring-1 ring-[color:var(--green-border)]">
        <ParamRow label="Застройщик" value={complex.developer} />
        <ParamRow label="Адрес" value={complex.address} />
        <ParamRow label="Комнат" value={String(lot.rooms)} />
        <ParamRow label="Площадь" value={`${lot.area} м²`} />
        <ParamRow label="Этаж" value={lot.floor} />
        <ParamRow label="Цена" value={formatPriceUsd(lot.price)} />
      </div>
    </article>
  )
}

function SecondaryLotPreview({ lot, index }: { lot: SecondaryLot; index: number }) {
  return (
    <article className="space-y-3">
      <div className="flex items-start gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: 'rgba(96,165,250,0.15)', color: MARKET_COLORS.secondary }}
        >
          {index}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MARKET_COLORS.secondary }}>
            Вторичка
          </p>
          <h3 className="text-base font-bold text-[color:var(--app-text)]">{lot.address}</h3>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-[color:var(--green-border)] bg-[var(--green-card)]">
        <img src={lot.imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
      </div>
      <p className="text-sm leading-relaxed text-[color:var(--hub-body)]">{lot.description}</p>
      <div className="rounded-lg bg-[var(--green-card)] p-3 ring-1 ring-[color:var(--green-border)]">
        <ParamRow label="Комнат" value={String(lot.rooms)} />
        <ParamRow label="Площадь" value={`${lot.area} м²`} />
        <ParamRow label="Этаж" value={lot.floor} />
        <ParamRow label="Цена" value={formatPriceUsd(lot.price)} />
      </div>
    </article>
  )
}

export function SelectionsNewPage() {
  const navigate = useNavigate()
  const selectionsBase = useSelectionsBasePath()
  const market = useSelectionsMarket()
  const { currentUser } = useAuth()
  const { state: leadsState } = useLeads()
  const branding = useAgencyBranding()

  const [title, setTitle] = useState('')
  const [leadQuery, setLeadQuery] = useState('')
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set())
  const [complexId, setComplexId] = useState(PRIMARY_COMPLEXES_MOCK[0]?.id ?? '')
  const [basket, setBasket] = useState<BasketItem[]>([])
  const [secQuery, setSecQuery] = useState('')
  const [sentOk, setSentOk] = useState(false)

  const activeComplex = useMemo(
    () => PRIMARY_COMPLEXES_MOCK.find((c) => c.id === complexId) ?? PRIMARY_COMPLEXES_MOCK[0],
    [complexId],
  )

  const leadRecipients = useMemo(() => {
    const q = leadQuery.trim().toLowerCase()
    return leadsState.leadPool.filter((l) => {
      if (!l.name?.trim()) return false
      if (LEAD_STAGE_COLUMN[l.stageId] === 'rejection') return false
      if (q.length < 2) return true
      return l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q)
    })
  }, [leadsState.leadPool, leadQuery])

  const secondaryFiltered = useMemo(() => {
    const q = secQuery.trim().toLowerCase()
    if (q.length < 2) return SECONDARY_LOTS_MOCK
    return SECONDARY_LOTS_MOCK.filter(
      (l) => l.address.toLowerCase().includes(q) || l.id.includes(q),
    )
  }, [secQuery])

  function toggleLead(id: string) {
    setSelectedLeadIds((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  function addPrimaryLot(lot: PrimaryLot) {
    if (!activeComplex) return
    const key = `p:${activeComplex.id}:${lot.id}`
    setBasket((prev) => {
      if (prev.some((b) => b.key === key)) return prev
      return [...prev, { kind: 'primary', key, complex: activeComplex, lot }]
    })
  }

  function addSecondaryLot(lot: SecondaryLot) {
    const key = `s:${lot.id}`
    setBasket((prev) => {
      if (prev.some((b) => b.key === key)) return prev
      return [...prev, { kind: 'secondary', key, lot }]
    })
  }

  function removeBasket(i: number) {
    setBasket((prev) => prev.filter((_, idx) => idx !== i))
  }

  const recipientLabel = useMemo(() => {
    const names = leadsState.leadPool
      .filter((l) => selectedLeadIds.has(l.id))
      .map((l) => l.name ?? l.id)
    if (names.length === 0) return ''
    if (names.length <= 2) return names.join(', ')
    return `${names.slice(0, 2).join(', ')} и ещё ${names.length - 2}`
  }, [leadsState.leadPool, selectedLeadIds])

  function handleSend() {
    if (!title.trim() || selectedLeadIds.size === 0 || basket.length === 0) return
    const hasPrimary = basket.some((b) => b.kind === 'primary')
    const hasSecondary = basket.some((b) => b.kind === 'secondary')
    if (market === 'newbuild' && hasSecondary) return
    if (market === 'secondary' && hasPrimary) return
    const props = basketToSelectionProperties(basket)
    const agentId = currentUser?.id ?? 'agent'
    const agentName = currentUser?.name ?? 'Агент'
    const now = new Date().toISOString()
    const created: Selection[] = []

    for (const leadId of selectedLeadIds) {
      const lead = leadsState.leadPool.find((l) => l.id === leadId)
      if (!lead?.name) continue
      created.push({
        id: newSelId(),
        title: title.trim(),
        clientId: leadId,
        clientName: lead.name,
        clientPhone: mockPhoneForLead(leadId),
        agentId,
        agentName,
        status: 'sent',
        properties: props.map((p) => ({ ...p, id: `${p.id}-${leadId.slice(-6)}` })),
        portalUrl: `https://portal.baza.sale/s/${newSelId().slice(-12)}`,
        createdAt: now,
        sentAt: now,
        viewCount: 0,
        notes: 'Отправлено из мастера подборок (лиды).',
      })
    }

    if (created.length === 0) return
    prependSelections(created)
    setSentOk(true)
    setTimeout(() => navigate(`${selectionsBase}/list`), 600)
  }

  const canSend =
    title.trim().length > 0 &&
    selectedLeadIds.size > 0 &&
    basket.length > 0 &&
    !(market === 'newbuild' && basket.some((b) => b.kind === 'secondary')) &&
    !(market === 'secondary' && basket.some((b) => b.kind === 'primary'))

  return (
    <DashboardShell hideSidebar>
      <div
        className="min-h-full w-full max-w-[1600px] box-border bg-[var(--app-bg)] px-6 py-8 text-[color:var(--app-text)]"
        style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--divider-subtle)] pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[color:var(--app-text)]">
              {market === 'newbuild' ? 'Подборка · новостройки' : 'Подборка · вторичка'}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[color:var(--hub-body)]">
              {market === 'newbuild'
                ? 'Только лоты первички (ЖК → квартиры). Получатели — из лидов в системе. В письме фото, описание и параметры; логотип и название агентства — из настроек бренда.'
                : 'Только объекты вторичного рынка. Получатели — из лидов в системе. В письме фото, описание и параметры; логотип и название агентства — из настроек бренда.'}
            </p>
          </div>
          {sentOk && <span className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Сохранено, переход к списку…</span>}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_min(440px,42vw)]">
          <div className="space-y-8">
            <section className="rounded-xl border border-[color:var(--hub-card-border)] bg-[var(--hub-card-bg)] p-5 shadow-[inset_0_0_0_1px_var(--hub-card-border)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--hub-desc)]">
                Название подборки
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Варианты 2к у метро"
                className="mt-2 w-full rounded-lg border border-[color:var(--green-border)] bg-[var(--green-deep)] px-3 py-2.5 text-sm text-[color:var(--app-text)] outline-none placeholder:text-[color:var(--app-text-subtle)] focus:border-[color:var(--hub-card-border-hover)]"
              />
            </section>

            <section className="rounded-xl border border-[color:var(--hub-card-border)] bg-[var(--hub-card-bg)] p-5 shadow-[inset_0_0_0_1px_var(--hub-card-border)]">
              <div className="flex items-center gap-2 text-[color:var(--theme-accent-heading)]">
                <Users className="size-5" />
                <h2 className="text-sm font-bold uppercase tracking-wide">Получатели из лидов</h2>
              </div>
              <p className="mt-1 text-xs text-[color:var(--hub-body)]">
                Отправка только тем, кто занесён в воронку (исключены стадии отказа).
              </p>
              <input
                value={leadQuery}
                onChange={(e) => setLeadQuery(e.target.value)}
                placeholder="Поиск по имени или ID…"
                className="mt-3 w-full rounded-lg border border-[color:var(--green-border)] bg-[var(--green-deep)] px-3 py-2 text-sm text-[color:var(--app-text)] outline-none placeholder:text-[color:var(--app-text-subtle)] focus:border-[color:var(--hub-card-border-hover)]"
              />
              <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-[color:var(--green-border)]">
                {leadRecipients.length === 0 ? (
                  <p className="p-4 text-center text-sm text-[color:var(--app-text-muted)]">Никого не найдено</p>
                ) : (
                  leadRecipients.slice(0, 80).map((l) => (
                    <label
                      key={l.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-[color:var(--divider-subtle)] px-3 py-2 last:border-0 hover:bg-[var(--dropdown-hover)]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.has(l.id)}
                        onChange={() => toggleLead(l.id)}
                        className="size-4 accent-[var(--gold)]"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[color:var(--app-text)]">{l.name}</span>
                      <span className="shrink-0 text-[10px] uppercase text-[color:var(--app-text-subtle)]">{l.id}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="mt-2 text-xs text-[color:var(--app-text-muted)]">Выбрано: {selectedLeadIds.size}</p>
            </section>

            {market !== 'secondary' ? (
            <section className="rounded-xl border border-[color:var(--hub-card-border)] bg-[var(--hub-card-bg)] p-5 shadow-[inset_0_0_0_1px_var(--hub-card-border)]">
              <div className="flex items-center gap-2 text-[color:var(--theme-accent-heading)]">
                <Building2 className="size-5" />
                <h2 className="text-sm font-bold uppercase tracking-wide">Первичка: ЖК и лоты</h2>
              </div>
              <select
                value={complexId}
                onChange={(e) => setComplexId(e.target.value)}
                className="mt-3 w-full rounded-lg border border-[color:var(--green-border)] bg-[var(--green-deep)] px-3 py-2 text-sm text-[color:var(--app-text)] outline-none focus:border-[color:var(--hub-card-border-hover)]"
              >
                {PRIMARY_COMPLEXES_MOCK.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.developer}
                  </option>
                ))}
              </select>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {activeComplex?.lots.map((lot) => {
                  const key = `p:${activeComplex.id}:${lot.id}`
                  const inBasket = basket.some((b) => b.key === key)
                  return (
                    <div
                      key={lot.id}
                      className={cn(
                        'overflow-hidden rounded-lg border bg-[var(--green-deep)]',
                        inBasket ? 'border-[color:var(--hub-card-border-hover)]' : 'border-[color:var(--green-border)]',
                      )}
                    >
                      <img src={lot.imageUrl} alt="" className="aspect-video w-full object-cover opacity-90" />
                      <div className="p-3">
                        <p className="text-sm font-semibold text-[color:var(--app-text)]">{lot.label}</p>
                        <p className="text-xs text-[color:var(--hub-body)]">
                          {lot.rooms}к · {lot.area} м² · {formatPriceUsd(lot.price)}
                        </p>
                        <button
                          type="button"
                          disabled={inBasket}
                          onClick={() => addPrimaryLot(lot)}
                          className="mt-2 w-full rounded-md border border-[color:var(--hub-tile-icon-border)] py-1.5 text-xs font-bold uppercase tracking-wide text-[color:var(--theme-accent-heading)] transition-colors hover:bg-[var(--nav-item-bg-active)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {inBasket ? 'В подборке' : 'Добавить'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
            ) : null}

            {market !== 'newbuild' ? (
            <section className="rounded-xl border border-[color:var(--hub-card-border)] bg-[var(--hub-card-bg)] p-5 shadow-[inset_0_0_0_1px_var(--hub-card-border)]">
              <div className="flex items-center gap-2" style={{ color: MARKET_COLORS.secondary }}>
                <Home className="size-5" />
                <h2 className="text-sm font-bold uppercase tracking-wide">Вторичка: квартиры</h2>
              </div>
              <input
                value={secQuery}
                onChange={(e) => setSecQuery(e.target.value)}
                placeholder="Поиск по адресу…"
                className="mt-3 w-full rounded-lg border border-[color:var(--green-border)] bg-[var(--green-deep)] px-3 py-2 text-sm text-[color:var(--app-text)] outline-none placeholder:text-[color:var(--app-text-subtle)] focus:border-[color:var(--hub-card-border-hover)]"
              />
              <div className="mt-4 space-y-3">
                {secondaryFiltered.map((lot) => {
                  const key = `s:${lot.id}`
                  const inBasket = basket.some((b) => b.key === key)
                  return (
                    <div
                      key={lot.id}
                      className="flex gap-3 rounded-lg border border-[color:var(--green-border)] bg-[var(--green-deep)] p-3"
                    >
                      <img src={lot.imageUrl} alt="" className="size-20 shrink-0 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[color:var(--app-text)]">{lot.address}</p>
                        <p className="text-xs text-[color:var(--hub-body)]">
                          {lot.rooms}к · {lot.area} м² · {lot.floor}
                        </p>
                        <p className="text-xs font-medium text-[color:var(--gold)]">{formatPriceUsd(lot.price)}</p>
                        <button
                          type="button"
                          disabled={inBasket}
                          onClick={() => addSecondaryLot(lot)}
                          className="mt-2 rounded-md border border-sky-500/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-300 hover:bg-sky-500/10 disabled:opacity-40"
                        >
                          {inBasket ? 'В подборке' : 'Добавить'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
            ) : null}

            <section className="rounded-xl border border-[color:var(--hub-card-border)] bg-[var(--hub-card-bg)] p-5 shadow-[inset_0_0_0_1px_var(--hub-card-border)]">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[color:var(--app-text)]">Порядок в подборке ({basket.length})</h2>
              <p className="text-xs text-[color:var(--app-text-muted)]">В превью и отправке лоты идут сверху вниз; между ними — разделительная линия.</p>
              {basket.length === 0 ? (
                <p className="mt-4 text-sm text-[color:var(--app-text-muted)]">Пока пусто</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {basket.map((item, i) => (
                    <li
                      key={item.key}
                      className="flex items-center gap-2 rounded-lg border border-[color:var(--green-border)] bg-[var(--green-deep)] px-3 py-2 text-sm text-[color:var(--app-text)]"
                    >
                      <span className="text-xs text-[color:var(--app-text-subtle)]">{i + 1}.</span>
                      <span className="min-w-0 flex-1 truncate">
                        {item.kind === 'primary'
                          ? `${item.complex.name} — ${item.lot.label}`
                          : item.lot.address}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBasket(i)}
                        className="shrink-0 rounded p-1 text-red-400/80 hover:bg-red-500/10"
                        aria-label="Убрать"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="flex flex-wrap gap-3 pb-8">
              <button
                type="button"
                disabled={!canSend}
                onClick={handleSend}
                className="alphabase-section-primary disabled:pointer-events-none"
              >
                <Send className="size-4" />
                Сформировать и отправить
              </button>
              <button
                type="button"
                onClick={() => {
                  setBasket([])
                  setSelectedLeadIds(new Set())
                  setTitle('')
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--green-border)] px-4 py-3 text-sm text-[color:var(--app-text-muted)] hover:bg-[var(--dropdown-hover)]"
              >
                <X className="size-4" />
                Очистить
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-4 lg:self-start">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-[color:var(--hub-desc)]">
              Предпросмотр письма
            </p>
            <SelectionSendPreview
              title={title}
              recipientLabel={recipientLabel}
              basket={basket}
              agencyName={branding.name || 'Ваше агентство'}
              logoDataUrl={branding.logoDataUrl}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
