import { useMemo, useState } from 'react'
import { Building2, Layers3 } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { NEW_BUILD_APARTMENTS_MOCK, NEW_BUILD_COMPLEXES_MOCK } from '@/data/bookings-catalog-mock'

export default function NewBuildingsCatalogPage() {
  const [complexId, setComplexId] = useState(NEW_BUILD_COMPLEXES_MOCK[0]?.id ?? '')
  const activeComplex = useMemo(
    () => NEW_BUILD_COMPLEXES_MOCK.find((c) => c.id === complexId) ?? NEW_BUILD_COMPLEXES_MOCK[0],
    [complexId],
  )
  const units = useMemo(
    () => NEW_BUILD_APARTMENTS_MOCK.filter((u) => u.rcId === (activeComplex?.id ?? '')),
    [activeComplex],
  )

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Каталог ЖК</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Проекты новостроек, юниты и статусы лотов в едином каталоге первичного рынка.
            </p>
          </div>

          <div className="grid min-h-[460px] grid-cols-1 gap-3 lg:grid-cols-[1.05fr_1fr]">
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Проекты</h2>
              </div>
              <div className="space-y-2">
                {NEW_BUILD_COMPLEXES_MOCK.map((complex) => (
                  <button
                    key={complex.id}
                    type="button"
                    onClick={() => setComplexId(complex.id)}
                    className="w-full rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-left transition-colors hover:border-[color:var(--gold)]/35"
                  >
                    <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{complex.name}</p>
                    <p className="text-xs text-[color:var(--workspace-text-muted)]">{complex.developerName}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Layers3 className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Юниты проекта</h2>
              </div>
              <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-3">
                <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{activeComplex?.name}</p>
                <p className="text-xs text-[color:var(--workspace-text-muted)]">{activeComplex?.developerName}</p>
              </div>
              <div className="mt-2 space-y-2">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{unit.label}</p>
                    <p className="text-xs text-[color:var(--workspace-text-muted)]">{unit.typology}</p>
                  </div>
                ))}
                {units.length === 0 && (
                  <p className="text-sm text-[color:var(--workspace-text-muted)]">Для проекта пока нет лотов.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
