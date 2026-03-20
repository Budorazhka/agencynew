import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SupremeOwnerDashboardPage } from '@/components/owner/SupremeOwnerDashboardPage'
import { useNavigate } from 'react-router-dom'
import '@/components/leads/leads-secret-table.css'

type ProductSection = 'network' | null

export function ProductPage() {
  const [section, setSection] = useState<ProductSection>(null)
  const navigate = useNavigate()

  if (section === 'network') {
    return (
      <div className="leads-page-root -m-6 min-h-[calc(100vh+3rem)] lg:-m-8 lg:min-h-[calc(100vh+4rem)]">
        <div className="leads-page-bg" aria-hidden />
        <div className="leads-page-ornament" aria-hidden />
        <div className="leads-page relative z-10 p-6 lg:p-8 space-y-4">
          {/* Breadcrumb back */}
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSection(null)}
              className="gap-2 text-[rgba(242,207,141,0.7)] hover:text-[#fcecc8] hover:bg-transparent px-0"
            >
              <ArrowLeft className="size-4" />
              Продукт
            </Button>
            <span className="text-[rgba(242,207,141,0.3)]">/</span>
            <span className="text-[rgba(242,207,141,0.85)] font-medium">МЛМ-аналитика</span>
          </div>
          {/* Analytics in white container so its CSS vars render correctly */}
          <div className="leads-page-light-panel rounded-2xl bg-[#eaf4ee] shadow-xl overflow-hidden">
            <SupremeOwnerDashboardPage />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="leads-page-root -m-6 min-h-[calc(100vh+3rem)] lg:-m-8 lg:min-h-[calc(100vh+4rem)]">
      <div className="leads-page-bg" aria-hidden />
      <div className="leads-page-ornament" aria-hidden />
      <div className="leads-page relative z-10 flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-2xl space-y-10 text-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-[rgba(242,207,141,0.45)] mb-1">Панель управления</p>
            <h1 className="text-3xl font-bold text-[#fcecc8]">Продукт</h1>
            <p className="mt-3 text-sm text-[rgba(242,207,141,0.62)]">
              Оба модуля доступны сразу и оформлены в единой активной схеме.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">

          {/* МЛМ-аналитика */}
          <button
            onClick={() => setSection('network')}
            className="group relative overflow-hidden rounded-[28px] border border-[rgba(242,207,141,0.32)] bg-[linear-gradient(180deg,rgba(21,63,47,0.96)_0%,rgba(11,37,28,0.98)_100%)] p-6 text-left shadow-[0_12px_34px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[rgba(242,207,141,0.56)] hover:shadow-[0_18px_42px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(242,207,141,0.14),rgba(242,207,141,0))]" />
            <div className="pointer-events-none absolute right-[-36px] top-6 h-24 w-24 rounded-full bg-[rgba(242,207,141,0.08)] blur-2xl" />
            <div className="mb-5 flex min-h-[210px] w-full items-center justify-center overflow-hidden rounded-[22px] border border-[rgba(242,207,141,0.16)] bg-[radial-gradient(circle_at_top,rgba(242,207,141,0.08),rgba(8,28,21,0.16)_58%,rgba(8,28,21,0.02)_100%)] px-4">
              <img src={`${import.meta.env.BASE_URL}mlm-analytics-hero.png`} alt="" className="max-h-[200px] w-auto max-w-full object-contain object-center transition-transform duration-200 group-hover:scale-[1.04]" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[rgba(242,207,141,0.42)]">
              Активный модуль
            </p>
            <h3 className="mt-2 text-lg font-bold text-[#fcecc8]">МЛМ-аналитика</h3>
            <p className="mt-2 text-sm leading-6 text-[rgba(242,207,141,0.64)]">
              KPI, партнёры, воронка и активность
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(242,207,141,0.24)] bg-[rgba(242,207,141,0.08)] px-4 py-2 text-xs font-semibold text-[rgba(252,236,200,0.86)] transition-all group-hover:border-[rgba(242,207,141,0.44)] group-hover:bg-[rgba(242,207,141,0.12)]">
              Открыть
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Объекты */}
          <button
            onClick={() => navigate('/dashboard/my-properties')}
            className="group relative overflow-hidden rounded-[28px] border border-[rgba(242,207,141,0.32)] bg-[linear-gradient(180deg,rgba(21,63,47,0.96)_0%,rgba(11,37,28,0.98)_100%)] p-6 text-left shadow-[0_12px_34px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[rgba(242,207,141,0.56)] hover:shadow-[0_18px_42px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(242,207,141,0.14),rgba(242,207,141,0))]" />
            <div className="pointer-events-none absolute right-[-36px] top-6 h-24 w-24 rounded-full bg-[rgba(242,207,141,0.08)] blur-2xl" />
            <div className="mb-5 flex min-h-[210px] w-full items-center justify-center overflow-hidden rounded-[22px] border border-[rgba(242,207,141,0.16)] bg-[radial-gradient(circle_at_top,rgba(242,207,141,0.08),rgba(8,28,21,0.16)_58%,rgba(8,28,21,0.02)_100%)] px-4">
              <img
                src={`${import.meta.env.BASE_URL}b4240bbd-e9b3-48f1-b848-78561518c053-removebg-preview.png`}
                alt=""
                className="max-h-[210px] w-auto max-w-full scale-[1.06] object-contain object-center transition-transform duration-200 group-hover:scale-[1.1]"
              />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[rgba(242,207,141,0.42)]">
              Активный модуль
            </p>
            <h3 className="mt-2 text-lg font-bold text-[#fcecc8]">Объекты</h3>
            <p className="mt-2 text-sm leading-6 text-[rgba(242,207,141,0.64)]">
              Управление объектами и витриной
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(242,207,141,0.24)] bg-[rgba(242,207,141,0.08)] px-4 py-2 text-xs font-semibold text-[rgba(252,236,200,0.86)] transition-all group-hover:border-[rgba(242,207,141,0.44)] group-hover:bg-[rgba(242,207,141,0.12)]">
              Открыть
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </button>

          </div>
        </div>
      </div>
    </div>
  )
}
