import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  Clock3,
  Crown,
  Handshake,
  MessageCircle,
  PhoneCall,
  Rows3,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { RoleBadge } from './RoleBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboard } from '@/context/DashboardContext'
import { formatCrmTime, getCityById, getCountryByCityId } from '@/data/mock'
import { getPartnerAnalytics, type ActivityMarker, type AnalyticsPeriod } from '@/lib/city-analytics'

const PERIOD_OPTIONS: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'allTime', label: 'Все время' },
]

const MARKER_COLORS: Record<ActivityMarker, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-rose-500',
}

export function PartnerAnalyticsPage() {
  const navigate = useNavigate()
  const { cityId, partnerId } = useParams<{ cityId: string; partnerId: string }>()
  const { state } = useDashboard()
  const [period, setPeriod] = useState<AnalyticsPeriod>('week')

  const city = cityId ? getCityById(state.cities, cityId) : undefined
  const country = city ? getCountryByCityId(city.id) : undefined
  const analytics = useMemo(() => {
    if (!city || !partnerId) return null
    return getPartnerAnalytics(city, partnerId, period)
  }, [city, partnerId, period])

  if (!city || !analytics) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Партнер или город не найден</p>
      </div>
    )
  }

  const { partner, row, points, funnel, conversions } = analytics
  const chartMax = Math.max(...points?.map((point) => point?.leads ?? 0), 1)
  const channelStats = [
    { label: 'Звонки', value: row?.callClicks ?? 0, icon: PhoneCall },
    { label: 'Чаты', value: row?.chatOpens ?? 0, icon: MessageCircle },
    { label: 'Подборки', value: row?.selectionsCreated ?? 0, icon: Rows3 },
    { label: 'Смены стадий', value: row?.stageChangesCount ?? 0, icon: ShieldCheck },
  ]
  const channelMax = Math.max(...channelStats.map((item) => item.value), 1)

  return (
    <div className="space-y-6 text-[15px] leading-relaxed text-slate-900 sm:text-base">
      <Header
        title={`Аналитика партнера ${partner.name}`}
        breadcrumbs={[
          { label: 'Мир', href: '/dashboard' },
          { label: country?.name ?? 'Страна' },
          { label: city.name, href: `/dashboard/city/${city.id}` },
          { label: partner.name },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate(`/dashboard/city/${city.id}`)}>
          <ArrowLeft className="mr-2 size-4" />
          Назад к городу
        </Button>
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
          {PERIOD_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriod(item.value)}
              className={
                'rounded-full px-3 py-1.5 text-base font-semibold transition-colors ' +
                (item.value === period
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="flex min-w-0 flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="max-w-full break-words text-[clamp(1.25rem,3vw,1.75rem)] font-semibold leading-tight">
                {partner.name}
              </h2>
              {partner.type === 'master' && <Crown className="size-5 text-amber-500" />}
              {partner.type === 'master' && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Мастер города
                </span>
              )}
            </div>
            <p className="break-all text-base text-slate-700 sm:break-words">{partner.login}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {partner.roles.map((role) => (
                <RoleBadge key={role} role={role} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-base md:min-w-[340px]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">Время в системе</p>
              <p className="text-lg font-semibold text-slate-900 tabular-nums">{formatCrmTime(partner.crmMinutes)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">Активность</p>
              <p className="text-lg font-semibold text-slate-900 tabular-nums">
                {row?.activityTotal?.toLocaleString('ru-RU') ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">Сделки</p>
              <p className="text-lg font-semibold text-slate-900 tabular-nums">{row?.deals?.toLocaleString('ru-RU') ?? 0}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">Комиссия</p>
              <p className="text-lg font-semibold text-slate-900 tabular-nums">
                ${row?.commissionUsd?.toLocaleString('ru-RU') ?? 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="py-4">
          <CardContent className="p-0 px-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <BarChart3 className="size-5" />
              </div>
              <div>
                <p className="text-base font-medium text-slate-700">Лиды</p>
                <p className="text-2xl font-semibold leading-tight text-slate-900 tabular-nums">
                  {row?.leadsAdded?.toLocaleString('ru-RU') ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent className="p-0 px-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Handshake className="size-5" />
              </div>
              <div>
                <p className="text-base font-medium text-slate-700">Конверсия лид → сделка</p>
                <p className="text-2xl font-semibold leading-tight text-slate-900 tabular-nums">
                  {conversions?.leadToDeal ?? 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent className="p-0 px-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <Clock3 className="size-5" />
              </div>
              <div>
                <p className="text-base font-medium text-slate-700">Онлайн за 7 дней</p>
                <p className="text-2xl font-semibold leading-tight text-slate-900 tabular-nums">{row?.onlineDaysLast7 ?? 0} дней</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent className="p-0 px-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Wallet className="size-5" />
              </div>
              <div>
                <p className="text-base font-medium text-slate-700">Комиссия</p>
                <p className="text-2xl font-semibold leading-tight text-slate-900 tabular-nums">
                  ${row?.commissionUsd?.toLocaleString('ru-RU') ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-slate-900">Динамика лидов партнера</CardTitle>
            <CardDescription className="text-sm text-slate-700">Период: {analytics.periodLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="grid h-44 items-end gap-1"
              style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
            >
              {points?.map((point, index) => {
                const shouldShowLabel =
                  (points?.length ?? 0) <= 12 || index % Math.max(1, Math.floor((points?.length ?? 0) / 8)) === 0

                return (
                  <div key={point?.label + index} className="flex min-w-0 flex-col items-center gap-1">
                    <div className="relative flex h-36 w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-sky-500/85"
                        style={{ height: `${Math.max(8, Math.round(((point?.leads ?? 0) / chartMax) * 100))}%` }}
                        title={`${point?.label}: ${point?.leads}`}
                      />
                    </div>
                    <span className="truncate text-xs text-slate-600">
                      {shouldShowLabel ? point?.label : '·'}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-slate-900">Текущая активность</CardTitle>
            <CardDescription className="text-sm text-slate-700">
              {row.isOnline ? 'Сейчас в сети' : 'Сейчас офлайн'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelStats.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-base">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                    <item.icon className="size-3.5" />
                    {item.label}
                  </span>
                  <span className="font-semibold text-slate-900 tabular-nums">{item.value.toLocaleString('ru-RU')}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-700"
                    style={{ width: `${Math.max(8, Math.round((item.value / channelMax) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Онлайн-метка за неделю</p>
              <div className="flex items-center gap-1.5">
                {row?.onlineWeekMarkers?.map((marker, markerIndex) => (
                  <span key={markerIndex} className={`size-2.5 rounded-full ${MARKER_COLORS[marker]}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl text-slate-900">Воронка партнера</CardTitle>
          <CardDescription className="text-sm text-slate-700">От лида до сделки</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Новые лиды</p>
            <p className="text-2xl font-semibold leading-tight text-slate-900 tabular-nums">
              {funnel?.newLeads?.toLocaleString('ru-RU') ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Презентации</p>
            <p className="text-2xl font-semibold leading-tight text-slate-900 tabular-nums">
              {funnel?.presentations?.toLocaleString('ru-RU') ?? 0}
            </p>
            <p className="mt-1 text-sm text-slate-700">Конверсия: {conversions?.leadToPresentation ?? 0}%</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Показы</p>
            <p className="text-2xl font-semibold leading-tight text-slate-900 tabular-nums">
              {funnel?.showings?.toLocaleString('ru-RU') ?? 0}
            </p>
            <p className="mt-1 text-sm text-slate-700">Конверсия: {conversions?.presentationToShowing ?? 0}%</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Сделки</p>
            <p className="text-2xl font-semibold leading-tight text-slate-900 tabular-nums">
              {funnel?.deals?.toLocaleString('ru-RU') ?? 0}
            </p>
            <p className="mt-1 text-sm text-slate-700">Конверсия: {conversions?.showingToDeal ?? 0}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
