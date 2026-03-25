import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Home, Send, Trash2, Users, X } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { cn } from '@/lib/utils'
import { getBranding } from '@/store/agencyStore'
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
import type { Selection, SelectionProperty } from '@/types/selections'
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
      className="rounded-xl border border-[#e6c364]/20 bg-[#f8faf9] text-slate-900 shadow-inner"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="border-b border-slate-200/90 px-6 py-5">
        {logoDataUrl ? (
          <img src={logoDataUrl} alt="" className="max-h-14 max-w-[200px] object-contain object-left" />
        ) : (
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Логотип агентства</div>
        )}
        <h2 className="mt-4 text-lg font-bold text-slate-900">{title || 'Подборка объектов'}</h2>
        <p className="mt-1 text-sm text-slate-600">Для: {recipientLabel || '— выберите получателей из лидов'}</p>
      </div>

      <div className="space-y-0 px-6 py-4">
        {basket.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Добавьте лоты из первички или вторички</p>
        ) : (
          basket.map((item, i) => (
            <div key={item.key}>
              {i > 0 && <div className="my-6 border-t-2 border-dashed border-slate-300" aria-hidden />}
              {item.kind === 'primary' ? (
                <PrimaryLotPreview complex={item.complex} lot={item.lot} index={i + 1} />
              ) : (
                <SecondaryLotPreview lot={item.lot} index={i + 1} />
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {agencyName || 'Название агентства'}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">Подборка сформирована в системе агентства</p>
      </div>
    </div>
  )
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value}</span>
    </div>
  )
}

function PrimaryLotPreview({ complex, lot, index }: { complex: PrimaryComplex; lot: PrimaryLot; index: number }) {
  return (
    <article className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e6c364]/20 text-xs font-bold text-[#8a7020]">
          {index}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#c9a84c]">Новостройка</p>
          <h3 className="text-base font-bold text-slate-900">{complex.name}</h3>
          <p className="text-sm text-slate-600">{lot.label}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <img src={lot.imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
      </div>
      <p className="text-sm leading-relaxed text-slate-700">{lot.description}</p>
      <div className="rounded-lg bg-white p-3 ring-1 ring-slate-100">
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
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">
          {index}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Вторичка</p>
          <h3 className="text-base font-bold text-slate-900">{lot.address}</h3>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <img src={lot.imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
      </div>
      <p className="text-sm leading-relaxed text-slate-700">{lot.description}</p>
      <div className="rounded-lg bg-white p-3 ring-1 ring-slate-100">
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
  const { currentUser } = useAuth()
  const { state: leadsState } = useLeads()
  const branding = getBranding()

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
    setTimeout(() => navigate('/dashboard/selections/list'), 600)
  }

  const canSend = title.trim().length > 0 && selectedLeadIds.size > 0 && basket.length > 0

  return (
    <DashboardShell hideSidebar topBack={{ label: 'Назад', route: '/dashboard/selections' }}>
      <div
        className="min-h-full w-full max-w-[1600px] box-border px-6 py-8 text-[#d0e8df]"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-emerald-900/35 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Отправка подборки</h1>
            <p className="mt-1 max-w-xl text-sm text-emerald-100/60">
              Выберите лоты первички (ЖК → квартиры) и вторички, получателей только из лидов в системе. В письме —
              фото, описание и параметры; несколько лотов разделяются линией. Логотип и название агентства — из
              настроек бренда.
            </p>
          </div>
          {sentOk && <span className="text-sm font-semibold text-[#e6c364]">Сохранено, переход к списку…</span>}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_min(440px,42vw)]">
          <div className="space-y-8">
            <section className="rounded-xl border border-[#e6c364]/15 bg-[#0a1f1a] p-5 shadow-[inset_0_0_0_1px_rgba(201,168,76,0.06)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#e6c364]/80">
                Название подборки
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Варианты 2к у метро"
                className="mt-2 w-full rounded-lg border border-emerald-800/50 bg-[#00110d] px-3 py-2.5 text-sm text-[#d0e8df] outline-none placeholder:text-emerald-100/35 focus:border-[#e6c364]/45"
              />
            </section>

            <section className="rounded-xl border border-[#e6c364]/15 bg-[#0a1f1a] p-5">
              <div className="flex items-center gap-2 text-[#e6c364]">
                <Users className="size-5" />
                <h2 className="text-sm font-bold uppercase tracking-wide">Получатели из лидов</h2>
              </div>
              <p className="mt-1 text-xs text-emerald-100/50">
                Отправка только тем, кто занесён в воронку (исключены стадии отказа).
              </p>
              <input
                value={leadQuery}
                onChange={(e) => setLeadQuery(e.target.value)}
                placeholder="Поиск по имени или ID…"
                className="mt-3 w-full rounded-lg border border-emerald-800/50 bg-[#00110d] px-3 py-2 text-sm outline-none focus:border-[#e6c364]/40"
              />
              <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-emerald-900/40">
                {leadRecipients.length === 0 ? (
                  <p className="p-4 text-center text-sm text-emerald-100/45">Никого не найдено</p>
                ) : (
                  leadRecipients.slice(0, 80).map((l) => (
                    <label
                      key={l.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-emerald-900/25 px-3 py-2 last:border-0 hover:bg-[#e6c364]/5"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.has(l.id)}
                        onChange={() => toggleLead(l.id)}
                        className="size-4 accent-[#e6c364]"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{l.name}</span>
                      <span className="shrink-0 text-[10px] uppercase text-emerald-100/40">{l.id}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="mt-2 text-xs text-emerald-100/45">Выбрано: {selectedLeadIds.size}</p>
            </section>

            <section className="rounded-xl border border-[#e6c364]/15 bg-[#0a1f1a] p-5">
              <div className="flex items-center gap-2 text-[#e6c364]">
                <Building2 className="size-5" />
                <h2 className="text-sm font-bold uppercase tracking-wide">Первичка: ЖК и лоты</h2>
              </div>
              <select
                value={complexId}
                onChange={(e) => setComplexId(e.target.value)}
                className="mt-3 w-full rounded-lg border border-emerald-800/50 bg-[#00110d] px-3 py-2 text-sm text-[#d0e8df] outline-none focus:border-[#e6c364]/40"
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
                        'overflow-hidden rounded-lg border bg-[#00110d]/80',
                        inBasket ? 'border-[#e6c364]/50' : 'border-emerald-900/40',
                      )}
                    >
                      <img src={lot.imageUrl} alt="" className="aspect-video w-full object-cover opacity-90" />
                      <div className="p-3">
                        <p className="text-sm font-semibold text-white">{lot.label}</p>
                        <p className="text-xs text-emerald-100/55">
                          {lot.rooms}к · {lot.area} м² · {formatPriceUsd(lot.price)}
                        </p>
                        <button
                          type="button"
                          disabled={inBasket}
                          onClick={() => addPrimaryLot(lot)}
                          className="mt-2 w-full rounded-md border border-[#e6c364]/35 py-1.5 text-xs font-bold uppercase tracking-wide text-[#e6c364] transition-colors hover:bg-[#e6c364]/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {inBasket ? 'В подборке' : 'Добавить'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-xl border border-[#e6c364]/15 bg-[#0a1f1a] p-5">
              <div className="flex items-center gap-2 text-sky-300">
                <Home className="size-5" />
                <h2 className="text-sm font-bold uppercase tracking-wide">Вторичка: квартиры</h2>
              </div>
              <input
                value={secQuery}
                onChange={(e) => setSecQuery(e.target.value)}
                placeholder="Поиск по адресу…"
                className="mt-3 w-full rounded-lg border border-emerald-800/50 bg-[#00110d] px-3 py-2 text-sm outline-none focus:border-[#e6c364]/40"
              />
              <div className="mt-4 space-y-3">
                {secondaryFiltered.map((lot) => {
                  const key = `s:${lot.id}`
                  const inBasket = basket.some((b) => b.key === key)
                  return (
                    <div
                      key={lot.id}
                      className="flex gap-3 rounded-lg border border-emerald-900/40 bg-[#00110d]/60 p-3"
                    >
                      <img src={lot.imageUrl} alt="" className="size-20 shrink-0 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{lot.address}</p>
                        <p className="text-xs text-emerald-100/55">
                          {lot.rooms}к · {lot.area} м² · {lot.floor}
                        </p>
                        <p className="text-xs font-medium text-[#e6c364]">{formatPriceUsd(lot.price)}</p>
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

            <section className="rounded-xl border border-[#e6c364]/15 bg-[#0a1f1a] p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-white">Порядок в подборке ({basket.length})</h2>
              <p className="text-xs text-emerald-100/45">В превью и отправке лоты идут сверху вниз; между ними — разделительная линия.</p>
              {basket.length === 0 ? (
                <p className="mt-4 text-sm text-emerald-100/45">Пока пусто</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {basket.map((item, i) => (
                    <li
                      key={item.key}
                      className="flex items-center gap-2 rounded-lg border border-emerald-900/35 bg-[#00110d] px-3 py-2 text-sm"
                    >
                      <span className="text-xs text-emerald-100/40">{i + 1}.</span>
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
                className="inline-flex items-center gap-2 rounded-sm bg-[#e6c364] px-6 py-3 text-sm font-semibold text-[#3d2e00] shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
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
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-800/50 px-4 py-3 text-sm text-emerald-100/70 hover:bg-emerald-900/20"
              >
                <X className="size-4" />
                Очистить
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-4 lg:self-start">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-emerald-100/40">
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
