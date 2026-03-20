import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentType, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import {
  BadgeDollarSign,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Crosshair,
  FileStack,
  Home,
  Layers3,
  MapPin,
  MapPinned,
  Upload,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatPrice } from './utils'
import type {
  BooleanChoice,
  Property,
  PropertyCategory,
  PropertyType,
  PropertyWizardStepId,
  PropertyWizardValues,
  SaleStatus,
  SellerType,
} from './types'
import {
  BALCONY_OPTIONS,
  BATHROOM_COUNT_OPTIONS,
  BATHROOM_TYPE_OPTIONS,
  CEILING_HEIGHT_OPTIONS,
  CITY_OPTIONS,
  COUNTRY_OPTIONS,
  ELEVATOR_OPTIONS,
  LAND_TYPE_OPTIONS,
  PARKING_OPTIONS,
  PROPERTY_CATEGORY_OPTIONS,
  PROPERTY_USAGE_OPTIONS,
  PROPERTY_WIZARD_STEPS,
  PROPERTY_WIZARD_STATUS_OPTIONS,
  ROAD_OPTIONS,
  RENOVATION_OPTIONS,
  SALE_STATUS_OPTIONS,
  SELLER_OPTIONS,
  SEWAGE_OPTIONS,
  SHORELINE_OPTIONS,
  VIEW_OPTIONS,
  WALL_MATERIAL_OPTIONS,
  WATER_SUPPLY_OPTIONS,
  buildPropertyFromWizard,
  createPropertyWizardValues,
  ensureTypeForCategory,
  getAllowedTypesForCategory,
  getWizardRules,
  type PropertyWizardActor,
} from './wizard-config'

interface PropertyWizardDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  actor: PropertyWizardActor
  property?: Property | null
  defaults?: Partial<PropertyWizardValues>
  onClose: () => void
  onSave: (property: Property) => void
}

const STEP_ICONS: Record<PropertyWizardStepId, ComponentType<{ className?: string }>> = {
  format: Layers3,
  base: BadgeDollarSign,
  location: MapPinned,
  specs: Building2,
  deal: ClipboardCheck,
}

const SELECT_CLASS =
  'h-10 w-full rounded-[16px] border border-[rgba(242,207,141,0.16)] bg-[rgba(5,20,16,0.52)] px-3 text-[13px] text-[#fcecc8] shadow-none'
const FIELD_CLASS =
  'h-10 rounded-[16px] border-[rgba(242,207,141,0.16)] bg-[rgba(5,20,16,0.52)] px-3 text-[13px] text-[#fcecc8]'

interface MapHotspot {
  label: string
  x: number
  y: number
}

interface CityMapPreset {
  centerLat: number
  centerLng: number
  latSpan: number
  lngSpan: number
  hotspots: readonly MapHotspot[]
}

const DEFAULT_CITY_MAP_PRESET: CityMapPreset = {
  centerLat: 41.7151,
  centerLng: 44.8271,
  latSpan: 0.12,
  lngSpan: 0.16,
  hotspots: [
    { label: 'Центр', x: 50, y: 50 },
    { label: 'У моря', x: 62, y: 76 },
    { label: 'Новый район', x: 36, y: 38 },
  ],
}

const CITY_MAP_PRESETS: Record<string, CityMapPreset> = {
  Тбилиси: {
    centerLat: 41.7151,
    centerLng: 44.8271,
    latSpan: 0.14,
    lngSpan: 0.18,
    hotspots: [
      { label: 'Ваке', x: 28, y: 36 },
      { label: 'Сабуртало', x: 44, y: 38 },
      { label: 'Ортачала', x: 58, y: 58 },
      { label: 'Исани', x: 69, y: 52 },
    ],
  },
  Батуми: {
    centerLat: 41.6168,
    centerLng: 41.6367,
    latSpan: 0.1,
    lngSpan: 0.12,
    hotspots: [
      { label: 'Старый Батуми', x: 34, y: 44 },
      { label: 'Новый бульвар', x: 61, y: 60 },
      { label: 'Гонио', x: 79, y: 80 },
      { label: 'Махинджаури', x: 20, y: 27 },
    ],
  },
  Кобулети: {
    centerLat: 41.8197,
    centerLng: 41.7755,
    latSpan: 0.08,
    lngSpan: 0.08,
    hotspots: [
      { label: 'Центр Кобулети', x: 48, y: 52 },
      { label: 'Линия моря', x: 58, y: 66 },
      { label: 'Северный въезд', x: 36, y: 34 },
    ],
  },
  Пхукет: {
    centerLat: 7.8804,
    centerLng: 98.3923,
    latSpan: 0.3,
    lngSpan: 0.36,
    hotspots: [
      { label: 'Патонг', x: 37, y: 45 },
      { label: 'Ката', x: 56, y: 70 },
      { label: 'Банг Тао', x: 42, y: 27 },
      { label: 'Раваи', x: 70, y: 83 },
    ],
  },
  Паттайя: {
    centerLat: 12.9236,
    centerLng: 100.8825,
    latSpan: 0.16,
    lngSpan: 0.14,
    hotspots: [
      { label: 'Центральная Паттайя', x: 46, y: 50 },
      { label: 'Джомтьен', x: 61, y: 72 },
      { label: 'Наклуа', x: 39, y: 28 },
      { label: 'Пратамнак', x: 55, y: 60 },
    ],
  },
  Бангкок: {
    centerLat: 13.7563,
    centerLng: 100.5018,
    latSpan: 0.22,
    lngSpan: 0.24,
    hotspots: [
      { label: 'Sukhumvit', x: 56, y: 54 },
      { label: 'Sathorn', x: 48, y: 61 },
      { label: 'Ari', x: 52, y: 40 },
      { label: 'Riverside', x: 66, y: 58 },
    ],
  },
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getCityMapPreset(city: string): CityMapPreset {
  return CITY_MAP_PRESETS[city] ?? DEFAULT_CITY_MAP_PRESET
}

function pointToCoordinates(x: number, y: number, preset: CityMapPreset) {
  const lng = preset.centerLng + ((x - 50) / 100) * preset.lngSpan
  const lat = preset.centerLat - ((y - 50) / 100) * preset.latSpan
  return { lat, lng }
}

function coordinatesToPoint(latValue: string, lngValue: string, preset: CityMapPreset) {
  const lat = Number.parseFloat(latValue)
  const lng = Number.parseFloat(lngValue)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  return {
    x: clampNumber(((lng - preset.centerLng) / preset.lngSpan) * 100 + 50, 6, 94),
    y: clampNumber(50 - ((lat - preset.centerLat) / preset.latSpan) * 100, 8, 92),
  }
}

function formatMapCoordinates(latValue: string, lngValue: string) {
  if (!latValue.trim() || !lngValue.trim()) return 'Точка не выбрана'
  return `${latValue}, ${lngValue}`
}

const COMMISSION_OPTIONS = [
  {
    value: '3',
    label: '3% — Минимальный уровень комиссии',
    description: 'Объявление попадёт в общую ленту, но риэлторы будут уделять ему меньше внимания.',
  },
  {
    value: '3.5',
    label: '3,5% — Чуть выше среднего',
    description: 'Вероятность, что риэлторы возьмутся за продажу быстрее. Объект получит немного больше внимания.',
  },
  {
    value: '4',
    label: '4% — Оптимальный баланс',
    description: 'Хорошее сочетание выгоды и интереса. Риэлторы активно берут такие объекты в работу.',
  },
  {
    value: '4.5',
    label: '4,5% — Повышенный интерес',
    description: 'Объект получает приоритет в выдаче и внимание сильных агентов. Продажа обычно ускоряется.',
  },
  {
    value: '5',
    label: '5% — Максимальная выгода и приоритет',
    description: 'Такие объекты продвигаются заметнее, ранжируются выше и показываются чаще.',
  },
  {
    value: '0',
    label: '0% — Без комиссии',
    description: 'Риэлторы не будут заинтересованы в продаже объекта, поэтому он выпадает из приоритетов.',
  },
] as const

function WizardTextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  rows?: number
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-h-[88px] w-full rounded-[16px] border border-[rgba(242,207,141,0.16)] bg-[rgba(5,20,16,0.52)] px-3 py-2.5 text-[13px] text-[#fcecc8] outline-none transition-colors placeholder:text-[rgba(242,207,141,0.35)] focus:border-[rgba(52,211,153,0.6)]"
    />
  )
}

function FieldShell({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold text-[#fcecc8]">
          {label}
          {required && <span className="ml-1 text-emerald-400">*</span>}
        </span>
        {hint && <span className="text-[10px] text-[rgba(242,207,141,0.45)]">{hint}</span>}
      </div>
      {children}
    </label>
  )
}

function ChoiceTile({
  active,
  title,
  description,
  compact = false,
  onClick,
}: {
  active: boolean
  title: string
  description?: string
  compact?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        compact ? 'min-h-[68px] rounded-[16px] px-3.5 py-2.5' : 'min-h-[88px] rounded-[18px] px-4 py-3',
        'border text-left transition-all',
        active
          ? 'border-emerald-400/70 bg-[rgba(16,185,129,0.16)] shadow-[0_12px_32px_rgba(16,185,129,0.18)]'
          : 'border-[rgba(242,207,141,0.16)] bg-[rgba(5,20,16,0.46)] hover:border-[rgba(242,207,141,0.32)] hover:bg-[rgba(7,28,22,0.56)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={cn(compact ? 'text-[13px]' : 'text-[14px]', 'font-semibold leading-tight text-[#fcecc8]')}>{title}</div>
          {description && !compact && <div className="mt-0.5 text-[12px] leading-snug text-[rgba(242,207,141,0.48)]">{description}</div>}
        </div>
        <div
          className={cn(
            compact ? 'size-4' : 'size-4.5',
            'mt-0.5 flex shrink-0 items-center justify-center rounded-full border',
            active ? 'border-emerald-300 bg-emerald-400/20 text-emerald-300' : 'border-[rgba(242,207,141,0.18)] text-transparent',
          )}
        >
          <Check className={cn(compact ? 'size-2.5' : 'size-3')} />
        </div>
      </div>
    </button>
  )
}

function ChipGroup({
  options,
  values,
  onToggle,
}: {
  options: readonly string[]
  values: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = values.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
            'min-h-10 rounded-full border px-4 py-2 text-[13px] transition-colors',
            active
              ? 'border-emerald-400/70 bg-emerald-400/14 text-emerald-300'
              : 'border-[rgba(242,207,141,0.14)] bg-[rgba(5,20,16,0.42)] text-[rgba(242,207,141,0.7)] hover:border-[rgba(242,207,141,0.28)] hover:text-[#fcecc8]',
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function SingleChipGroup({
  options,
  value,
  onChange,
}: {
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
            'min-h-10 rounded-full border px-4 py-2 text-[13px] transition-colors',
            active
              ? 'border-emerald-400/70 bg-emerald-400/14 text-emerald-300'
              : 'border-[rgba(242,207,141,0.14)] bg-[rgba(5,20,16,0.42)] text-[rgba(242,207,141,0.7)] hover:border-[rgba(242,207,141,0.28)] hover:text-[#fcecc8]',
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function BooleanChoiceField({
  value,
  onChange,
  labels = { yes: 'Да', no: 'Нет' },
}: {
  value: BooleanChoice
  onChange: (value: BooleanChoice) => void
  labels?: { yes: string; no: string }
}) {
  return (
    <div className="flex gap-2">
      {([
        ['yes', labels.yes],
        ['no', labels.no],
      ] as const).map(([nextValue, label]) => {
        const active = value === nextValue
        return (
          <button
            key={nextValue}
            type="button"
            onClick={() => onChange(nextValue)}
            className={cn(
              'flex-1 rounded-[18px] border px-4 py-2.5 text-[13px] font-medium transition-colors',
              active
                ? 'border-emerald-400/70 bg-emerald-400/14 text-emerald-300'
                : 'border-[rgba(242,207,141,0.14)] bg-[rgba(5,20,16,0.42)] text-[rgba(242,207,141,0.7)] hover:border-[rgba(242,207,141,0.28)] hover:text-[#fcecc8]',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function BinaryFlagField({
  value,
  onChange,
  trueLabel,
  falseLabel,
}: {
  value: boolean
  onChange: (value: boolean) => void
  trueLabel: string
  falseLabel: string
}) {
  return (
    <div className="flex gap-2">
      {([
        [true, trueLabel],
        [false, falseLabel],
      ] as const).map(([flagValue, label]) => {
        const active = value === flagValue
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(flagValue)}
            className={cn(
              'flex-1 rounded-[18px] border px-4 py-2.5 text-[13px] font-medium transition-colors',
              active
                ? 'border-emerald-400/70 bg-emerald-400/14 text-emerald-300'
                : 'border-[rgba(242,207,141,0.14)] bg-[rgba(5,20,16,0.42)] text-[rgba(242,207,141,0.7)] hover:border-[rgba(242,207,141,0.28)] hover:text-[#fcecc8]',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function FileField({
  title,
  hint,
  multiple,
  fileNames,
  onFiles,
}: {
  title: string
  hint: string
  multiple?: boolean
  fileNames: string[]
  onFiles: (files: FileList | null) => void
}) {
  return (
    <label className="block rounded-[20px] border border-dashed border-[rgba(242,207,141,0.18)] bg-[rgba(5,20,16,0.34)] p-4 transition-colors hover:border-[rgba(52,211,153,0.45)]">
      <input
        type="file"
        multiple={multiple}
        className="hidden"
        onChange={(event) => onFiles(event.target.files)}
      />
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[14px] border border-[rgba(242,207,141,0.12)] bg-[rgba(242,207,141,0.06)] text-[rgba(242,207,141,0.72)]">
          <Upload className="size-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-[#fcecc8]">{title}</div>
          <div className="mt-0.5 text-[11px] leading-relaxed text-[rgba(242,207,141,0.45)]">{hint}</div>
          {fileNames.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {fileNames.map((fileName) => (
                <span
                  key={fileName}
                  className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300"
                >
                  {fileName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </label>
  )
}

export function PropertyWizardDialog({
  open,
  mode,
  actor,
  property,
  defaults,
  onClose,
  onSave,
}: PropertyWizardDialogProps) {
  const [values, setValues] = useState<PropertyWizardValues>(() => createPropertyWizardValues(property ?? undefined, defaults))
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const objectUrlsRef = useRef<string[]>([])

  useEffect(() => {
    if (!open) return
    const initialValues = createPropertyWizardValues(property ?? undefined, defaults)
    setValues(initialValues)
    setActiveStepIndex(mode === 'edit' ? 1 : 0)
    setIsMapModalOpen(false)
  }, [open, property, defaults, mode])

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    }
  }, [])

  const rules = useMemo(() => getWizardRules(values.type), [values.type])
  const currentStep = PROPERTY_WIZARD_STEPS[activeStepIndex]
  const allowedTypes = useMemo(() => getAllowedTypesForCategory(values.category), [values.category])
  const mapPreset = useMemo(() => getCityMapPreset(values.city), [values.city])
  const selectedMapPoint = useMemo(
    () => coordinatesToPoint(values.mapLat, values.mapLng, mapPreset),
    [values.mapLat, values.mapLng, mapPreset],
  )
  const mapCoordinatesLabel = useMemo(
    () => formatMapCoordinates(values.mapLat, values.mapLng),
    [values.mapLat, values.mapLng],
  )
  const mapLocationLabel = values.mapLocationLabel.trim() || 'Точка на карте не выбрана'

  function updateValue<Key extends keyof PropertyWizardValues>(key: Key, value: PropertyWizardValues[Key]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function toggleArrayValue<Key extends keyof PropertyWizardValues>(key: Key, value: string) {
    setValues((prev) => {
      const nextValue = prev[key]
      if (!Array.isArray(nextValue)) return prev
      return {
        ...prev,
        [key]: nextValue.includes(value)
          ? nextValue.filter((item) => item !== value)
          : [...nextValue, value],
      }
    })
  }

  function handleCategoryChange(category: PropertyCategory) {
    setValues((prev) => {
      const nextType = ensureTypeForCategory(prev.type, category)
      return {
        ...prev,
        category,
        type: nextType,
        sellerType: getWizardRules(nextType).supportsDeveloperSeller || prev.sellerType !== 'developer'
          ? prev.sellerType
          : 'owner',
      }
    })
  }

  function handleTypeChange(type: PropertyType) {
    const nextRules = getWizardRules(type)
    setValues((prev) => ({
      ...prev,
      type,
      sellerType: nextRules.supportsDeveloperSeller || prev.sellerType !== 'developer' ? prev.sellerType : 'owner',
    }))
  }

  function handleCountryChange(country: string) {
    const cityOptions = CITY_OPTIONS[country as keyof typeof CITY_OPTIONS] ?? CITY_OPTIONS.Грузия
    setValues((prev) => ({
      ...prev,
      country,
      city: cityOptions.includes(prev.city) ? prev.city : cityOptions[0],
      mapLocationLabel: '',
      mapLat: '',
      mapLng: '',
    }))
  }

  function handleCityChange(city: string) {
    setValues((prev) => ({
      ...prev,
      city,
      mapLocationLabel: '',
      mapLat: '',
      mapLng: '',
    }))
  }

  function applyMapSelection(x: number, y: number, label?: string) {
    const { lat, lng } = pointToCoordinates(x, y, mapPreset)
    const nextLabel = label?.trim() || values.mapLocationLabel.trim() || `${values.city}, точка на карте`
    setValues((prev) => ({
      ...prev,
      mapLocationLabel: nextLabel,
      mapLat: lat.toFixed(6),
      mapLng: lng.toFixed(6),
    }))
  }

  function handleMapCanvasClick(event: ReactMouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = clampNumber(((event.clientX - rect.left) / rect.width) * 100, 6, 94)
    const y = clampNumber(((event.clientY - rect.top) / rect.height) * 100, 8, 92)
    applyMapSelection(x, y, `${values.city}, точка на карте`)
  }

  function handlePhotoFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    objectUrlsRef.current.push(url)
    setValues((prev) => ({ ...prev, photo: url }))
  }

  function handlePlanFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setValues((prev) => ({ ...prev, planFileName: file.name }))
  }

  function handleMediaFiles(files: FileList | null) {
    const names = Array.from(files ?? []).map((file) => file.name)
    if (!names.length) return
    setValues((prev) => ({ ...prev, mediaFileNames: names }))
  }

  function getStepErrors(stepId: PropertyWizardStepId): string[] {
    const errors: string[] = []

    if (stepId === 'format') {
      if (!values.category) errors.push('Выберите сегмент.')
      if (!values.type) errors.push('Выберите тип объекта.')
      if (!values.country) errors.push('Укажите страну.')
      if (!values.city) errors.push('Укажите город.')
    }

    if (stepId === 'base') {
      if (!values.searchValue.trim()) errors.push('Укажите ЖК или комплекс.')
      if (!values.title.trim()) errors.push('Добавьте название объявления.')
      if (!values.description.trim()) errors.push('Добавьте описание.')
      if (rules.supportsSummary && !values.summary.trim()) errors.push('Опишите суть проекта.')
      if (!values.area.trim()) errors.push('Укажите площадь.')
      if (rules.supportsRooms && !values.rooms.trim()) errors.push('Укажите количество комнат.')
      if (!values.priceOnRequest && !values.price.trim()) errors.push('Укажите цену.')
    }

    if (stepId === 'location') {
      if (!values.address.trim()) errors.push('Укажите адрес.')
      if (rules.supportsShoreline && !values.shoreline) errors.push('Выберите береговую линию.')
    }

    if (stepId === 'specs') {
      if (rules.supportsFloor && !values.floor.trim()) errors.push('Укажите этаж.')
      if (rules.supportsTotalFloors && !values.totalFloors.trim()) errors.push('Укажите этажность.')
      if (rules.supportsRenovation && !values.renovation) errors.push('Выберите ремонт.')
      if (rules.supportsBathrooms && !values.bathroomsCount) errors.push('Укажите санузлы.')
    }

    if (stepId === 'deal') {
      if (!values.commissionPercent.trim()) errors.push('Выберите комиссию.')
      if (!values.sellerType) errors.push('Укажите тип продавца.')
    }

    return errors
  }

  const stepErrors = useMemo(() => {
    return Object.fromEntries(
      PROPERTY_WIZARD_STEPS.map((step) => [step.id, getStepErrors(step.id)]),
    ) as Record<PropertyWizardStepId, string[]>
  }, [values, rules])

  const incompleteStep = PROPERTY_WIZARD_STEPS.find((step) => stepErrors[step.id].length > 0)
  const canSubmit = !incompleteStep
  const completedCount = PROPERTY_WIZARD_STEPS.filter((step) => stepErrors[step.id].length === 0).length

  function handleSaveDraft() {
    const nextProperty = buildPropertyFromWizard({ ...values, status: 'draft' }, actor, property ?? undefined)
    onSave(nextProperty)
    onClose()
  }

  function handlePrimarySave() {
    if (!canSubmit && incompleteStep) {
      setActiveStepIndex(PROPERTY_WIZARD_STEPS.findIndex((step) => step.id === incompleteStep.id))
      return
    }

    const nextProperty = buildPropertyFromWizard(values, actor, property ?? undefined)
    onSave(nextProperty)
    onClose()
  }

  function renderFormatStep() {
    return (
      <div className="space-y-4">
        <section className="space-y-2.5">
          <div>
            <h3 className="text-[15px] font-semibold text-[#fcecc8]">1. Сегмент объекта</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {PROPERTY_CATEGORY_OPTIONS.map((option) => (
              <ChoiceTile
                key={option.value}
                active={values.category === option.value}
                title={option.label}
                compact
                onClick={() => handleCategoryChange(option.value)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
          <div>
            <h3 className="text-[15px] font-semibold text-[#fcecc8]">2. Тип карточки</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {allowedTypes.map((option) => (
              <ChoiceTile
                key={option.value}
                active={values.type === option.value}
                title={option.label}
                compact
                onClick={() => handleTypeChange(option.value)}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <FieldShell label="Страна" required>
            <Select value={values.country} onValueChange={handleCountryChange}>
              <SelectTrigger className={SELECT_CLASS}>
                <SelectValue placeholder="Выберите страну" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldShell>

          <FieldShell label="Город" required>
            <Select value={values.city} onValueChange={handleCityChange}>
              <SelectTrigger className={SELECT_CLASS}>
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent>
                {(CITY_OPTIONS[values.country as keyof typeof CITY_OPTIONS] ?? CITY_OPTIONS.Грузия).map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldShell>

          <FieldShell label="Статус" hint="Можно скорректировать позже">
            <Select value={values.status} onValueChange={(status) => updateValue('status', status as SaleStatus)}>
              <SelectTrigger className={SELECT_CLASS}>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_WIZARD_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldShell>
        </section>
      </div>
    )
  }

  function renderBaseStep() {
    return (
      <div className="space-y-4">
        <section className="grid gap-3 md:grid-cols-2">
          <FieldShell label="ЖК / комплекс" required>
            <Input
              value={values.searchValue}
              onChange={(event) => updateValue('searchValue', event.target.value)}
              placeholder="Например: Queen's Residence"
              className={FIELD_CLASS}
            />
          </FieldShell>

          <FieldShell label="Название объявления" required>
            <Input
              value={values.title}
              onChange={(event) => updateValue('title', event.target.value)}
              placeholder="Например: 3-к квартира в Queen's Residence"
              className={FIELD_CLASS}
            />
          </FieldShell>
        </section>

        {rules.supportsSummary && (
          <FieldShell label="Суть проекта" required>
            <WizardTextArea
              value={values.summary}
              onChange={(value) => updateValue('summary', value)}
              placeholder="Коротко опишите формат проекта, стадию и инвестиционную идею."
              rows={3}
            />
          </FieldShell>
        )}

        <FieldShell label="Описание" required>
          <WizardTextArea
            value={values.description}
            onChange={(value) => updateValue('description', value)}
            placeholder="Опишите планировку, локацию, плюсы, окружение и для кого этот объект подходит."
          />
        </FieldShell>

        <section className="grid gap-3 md:grid-cols-2">
          {rules.supportsRooms && (
            <FieldShell label="Количество комнат" required>
              <Input
                type="number"
                value={values.rooms}
                onChange={(event) => updateValue('rooms', event.target.value)}
                placeholder="2"
                className={FIELD_CLASS}
              />
            </FieldShell>
          )}

          <FieldShell label="Площадь, м²" required>
            <Input
              type="number"
              value={values.area}
              onChange={(event) => updateValue('area', event.target.value)}
              placeholder="100"
              className={FIELD_CLASS}
            />
          </FieldShell>

          <FieldShell label="Цена, $" required={!values.priceOnRequest}>
            <Input
              type="number"
              value={values.price}
              onChange={(event) => updateValue('price', event.target.value)}
              placeholder={values.priceOnRequest ? 'Можно оставить пустым' : '200000'}
              className={FIELD_CLASS}
            />
          </FieldShell>

          <FieldShell label="Цена за м², $" hint="Если пусто, посчитаем автоматически">
            <Input
              type="number"
              value={values.pricePerM2}
              onChange={(event) => updateValue('pricePerM2', event.target.value)}
              placeholder="1245"
              className={FIELD_CLASS}
            />
          </FieldShell>
        </section>

        {rules.supportsPriceOnRequest && (
          <FieldShell label="Цена по запросу" hint="Для проекта можно скрыть цену на витрине">
            <BinaryFlagField
              value={values.priceOnRequest}
              onChange={(flag) => updateValue('priceOnRequest', flag)}
              trueLabel="Показывать «по запросу»"
              falseLabel="Показывать цену"
            />
          </FieldShell>
        )}
      </div>
    )
  }

  function renderLocationStep() {
    return (
      <div className="space-y-4">
        <section className="rounded-[20px] border border-[rgba(242,207,141,0.12)] bg-[rgba(242,207,141,0.035)] p-3.5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="text-[15px] font-semibold text-[#fcecc8]">Адрес и геоточка</div>

            <Button
              type="button"
              onClick={() => setIsMapModalOpen(true)}
              className="h-10 rounded-full bg-emerald-500 px-4 text-[12px] text-white hover:bg-emerald-400"
            >
              <MapPinned className="size-4" />
              Выбрать на карте
            </Button>
          </div>

          <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-3">
              <FieldShell label="Адрес" required hint="Укажите адрес">
                <WizardTextArea
                  value={values.address}
                  onChange={(value) => updateValue('address', value)}
                  placeholder="ул. Шерифа Химшиашвили, 56а"
                  rows={3}
                />
              </FieldShell>

              <div className="rounded-[18px] border border-[rgba(242,207,141,0.12)] bg-[rgba(5,20,16,0.36)] px-3.5 py-3">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-[rgba(242,207,141,0.34)]">Координаты</div>
                  <div className="mt-2 text-[13px] font-semibold text-[#fcecc8]">{mapCoordinatesLabel}</div>
                  <div className="mt-1 text-[12px] text-[rgba(242,207,141,0.46)]">{mapLocationLabel}</div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="h-10 rounded-full bg-emerald-500 px-4 text-[12px] text-white hover:bg-emerald-400"
                >
                  <MapPinned className="size-4" />
                  Выбрать точку на карте
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyMapSelection(50, 50, `${values.city}, центр`)}
                  className="h-10 rounded-full border-[rgba(242,207,141,0.18)] bg-transparent px-4 text-[12px] text-[rgba(242,207,141,0.78)] hover:bg-[rgba(242,207,141,0.08)] hover:text-[#fcecc8]"
                >
                  <Crosshair className="size-4" />
                  Центр города
                </Button>
              </div>
            </div>

            <div className="rounded-[18px] border border-[rgba(242,207,141,0.12)] bg-[linear-gradient(180deg,_rgba(10,31,24,0.78),_rgba(7,24,19,0.82))] p-3">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="group relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-[20px] border border-dashed border-[rgba(242,207,141,0.2)] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_42%),rgba(5,20,16,0.42)] px-4 text-center transition-colors hover:border-emerald-400/45 hover:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_42%),rgba(5,20,16,0.5)]"
              >
                <div className="absolute left-4 top-4 rounded-full border border-[rgba(242,207,141,0.12)] bg-[rgba(5,20,16,0.46)] px-3 py-1 text-[11px] text-[rgba(242,207,141,0.62)]">
                  {values.country} / {values.city}
                </div>
                <div className="flex size-14 items-center justify-center rounded-[20px] border border-emerald-400/30 bg-emerald-400/12 text-emerald-300 transition-colors group-hover:bg-emerald-400/18">
                  <MapPinned className="size-6" />
                </div>
                <div className="mt-3 text-[16px] font-semibold tracking-[0.08em] text-[#fcecc8]">МЕСТО ПОД КАРТУ</div>
                <div className="mt-2 text-[12px] text-[rgba(242,207,141,0.5)]">Нажмите, чтобы открыть карту и поставить точку</div>
              </button>

              <div className="mt-4 rounded-[18px] border border-[rgba(242,207,141,0.1)] bg-[rgba(5,20,16,0.34)] p-3.5">
                <div className="text-[11px] uppercase tracking-[0.14em] text-[rgba(242,207,141,0.34)]">Выбранная точка</div>
                <div className="mt-2 text-[14px] font-semibold text-[#fcecc8]">{mapLocationLabel}</div>
                <div className="mt-1 text-[12px] text-[rgba(242,207,141,0.46)]">{mapCoordinatesLabel}</div>
              </div>
            </div>
          </div>
        </section>

        {rules.supportsViews && (
          <FieldShell label="Вид" hint="Можно выбрать несколько вариантов">
            <ChipGroup
              options={VIEW_OPTIONS}
              values={values.views}
              onToggle={(value) => toggleArrayValue('views', value)}
            />
          </FieldShell>
        )}

        <section className={cn('grid gap-3', rules.supportsRoadType ? 'md:grid-cols-2' : 'md:grid-cols-1')}>
          {rules.supportsRoadType && (
            <FieldShell label="Дорога к объекту">
              <SingleChipGroup
                options={ROAD_OPTIONS}
                value={values.roadType}
                onChange={(value) => updateValue('roadType', value)}
              />
            </FieldShell>
          )}

          {rules.supportsShoreline && (
            <FieldShell label="Береговая линия" required>
              <SingleChipGroup
                options={SHORELINE_OPTIONS}
                value={values.shoreline}
                onChange={(value) => updateValue('shoreline', value)}
              />
            </FieldShell>
          )}
        </section>
      </div>
    )
  }

  function renderSpecsStep() {
    return (
      <div className="space-y-4">
        <section className="grid gap-3 md:grid-cols-2">
          {rules.supportsFloor && (
            <FieldShell label="Этаж" required>
              <Input
                type="number"
                value={values.floor}
                onChange={(event) => updateValue('floor', event.target.value)}
                placeholder="4"
                className={FIELD_CLASS}
              />
            </FieldShell>
          )}

          {rules.supportsTotalFloors && (
            <FieldShell label="Этажность" required>
              <Input
                type="number"
                value={values.totalFloors}
                onChange={(event) => updateValue('totalFloors', event.target.value)}
                placeholder="7"
                className={FIELD_CLASS}
              />
            </FieldShell>
          )}

          {rules.supportsRenovation && (
            <FieldShell label="Ремонт" required>
              <Select value={values.renovation} onValueChange={(value) => updateValue('renovation', value)}>
                <SelectTrigger className={SELECT_CLASS}>
                  <SelectValue placeholder="Выберите ремонт" />
                </SelectTrigger>
                <SelectContent>
                  {RENOVATION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldShell>
          )}

          {rules.supportsCeilingHeight && (
            <FieldShell label="Высота потолков">
              <Select value={values.ceilingHeight} onValueChange={(value) => updateValue('ceilingHeight', value)}>
                <SelectTrigger className={SELECT_CLASS}>
                  <SelectValue placeholder="Выберите высоту" />
                </SelectTrigger>
                <SelectContent>
                  {CEILING_HEIGHT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option} м
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldShell>
          )}
        </section>

        {rules.supportsBathrooms && (
          <section className="grid gap-3 md:grid-cols-2">
            <FieldShell label="Санузел">
              <SingleChipGroup
                options={BATHROOM_TYPE_OPTIONS}
                value={values.bathroomType}
                onChange={(value) => updateValue('bathroomType', value)}
              />
            </FieldShell>

            <FieldShell label="Количество санузлов" required>
              <SingleChipGroup
                options={BATHROOM_COUNT_OPTIONS}
                value={values.bathroomsCount}
                onChange={(value) => updateValue('bathroomsCount', value)}
              />
            </FieldShell>
          </section>
        )}

        {rules.supportsBalcony && (
          <FieldShell label="Балкон / лоджия">
            <SingleChipGroup
              options={BALCONY_OPTIONS}
              value={values.balconyType}
              onChange={(value) => updateValue('balconyType', value)}
            />
          </FieldShell>
        )}

        {(rules.supportsElevator || rules.supportsParking || rules.supportsPropertyUsage) && (
          <section className="grid gap-3 md:grid-cols-2">
            {rules.supportsElevator && (
              <FieldShell label="Лифт">
                <ChipGroup
                  options={ELEVATOR_OPTIONS}
                  values={values.elevatorOptions}
                  onToggle={(value) => toggleArrayValue('elevatorOptions', value)}
                />
              </FieldShell>
            )}

            {rules.supportsParking && (
              <FieldShell label="Парковка">
                <ChipGroup
                  options={PARKING_OPTIONS}
                  values={values.parkingOptions}
                  onToggle={(value) => toggleArrayValue('parkingOptions', value)}
                />
              </FieldShell>
            )}

            {rules.supportsPropertyUsage && (
              <div className="md:col-span-2">
                <FieldShell label="Тип недвижимости / назначение">
                  <ChipGroup
                    options={PROPERTY_USAGE_OPTIONS}
                    values={values.propertyUsage}
                    onToggle={(value) => toggleArrayValue('propertyUsage', value)}
                  />
                </FieldShell>
              </div>
            )}
          </section>
        )}

        {(rules.supportsWallMaterial || rules.supportsGas || rules.supportsWaterSupply || rules.supportsSewage || rules.supportsLandType || rules.supportsElectricity) && (
          <section className="grid gap-3 md:grid-cols-2">
            {rules.supportsWallMaterial && (
              <FieldShell label="Материал стен">
                <Select value={values.wallMaterial} onValueChange={(value) => updateValue('wallMaterial', value)}>
                  <SelectTrigger className={SELECT_CLASS}>
                    <SelectValue placeholder="Выберите материал" />
                  </SelectTrigger>
                  <SelectContent>
                    {WALL_MATERIAL_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>
            )}

            {rules.supportsGas && (
              <FieldShell label="Газ">
                <BooleanChoiceField value={values.gas} onChange={(value) => updateValue('gas', value)} />
              </FieldShell>
            )}

            {rules.supportsWaterSupply && (
              <FieldShell label="Водоснабжение">
                <Select value={values.waterSupply} onValueChange={(value) => updateValue('waterSupply', value)}>
                  <SelectTrigger className={SELECT_CLASS}>
                    <SelectValue placeholder="Выберите вариант" />
                  </SelectTrigger>
                  <SelectContent>
                    {WATER_SUPPLY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>
            )}

            {rules.supportsSewage && (
              <FieldShell label="Канализация">
                <Select value={values.sewage} onValueChange={(value) => updateValue('sewage', value)}>
                  <SelectTrigger className={SELECT_CLASS}>
                    <SelectValue placeholder="Выберите вариант" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEWAGE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>
            )}

            {rules.supportsLandType && (
              <FieldShell label="Тип участка">
                <Select value={values.landType} onValueChange={(value) => updateValue('landType', value)}>
                  <SelectTrigger className={SELECT_CLASS}>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAND_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>
            )}

            {rules.supportsElectricity && (
              <FieldShell label="Электричество">
                <BooleanChoiceField value={values.electricity} onChange={(value) => updateValue('electricity', value)} />
              </FieldShell>
            )}
          </section>
        )}

        <section className={cn('grid gap-3', rules.supportsMediaUpload ? 'lg:grid-cols-3' : 'lg:grid-cols-2')}>
          <div className="space-y-3 lg:col-span-1">
            <FieldShell label="Главное фото" hint="Используется в карточке и таблице">
              <FileField
                title="Загрузить фото"
                hint="Поддерживается быстрый локальный превью."
                fileNames={values.photo ? ['cover-image'] : []}
                onFiles={handlePhotoFiles}
              />
            </FieldShell>
            {values.photo && (
              <div className="overflow-hidden rounded-[18px] border border-[rgba(242,207,141,0.14)] bg-[rgba(5,20,16,0.4)]">
                <img src={values.photo} alt={values.title || 'Фото объекта'} className="aspect-[4/3] w-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-3 lg:col-span-1">
            <FieldShell label="Планировка">
              <FileField
                title="Загрузить планировку"
                hint="Файл пригодится и для менеджеров, и для витрины."
                fileNames={values.planFileName ? [values.planFileName] : []}
                onFiles={handlePlanFiles}
              />
            </FieldShell>
          </div>

          {rules.supportsMediaUpload && (
            <div className="space-y-3 lg:col-span-1">
              <FieldShell label="Медиаконтент" hint="Особенно актуально для проектов.">
                <FileField
                  title="Загрузите дополнительный медиаконтент"
                  hint="Фото рендера, PDF, видеотуры и другие вспомогательные файлы."
                  multiple
                  fileNames={values.mediaFileNames}
                  onFiles={handleMediaFiles}
                />
              </FieldShell>
            </div>
          )}
        </section>
      </div>
    )
  }

  function renderDealStep() {
    return (
      <div className="space-y-4">
        <FieldShell label="Инфраструктура и преимущества" hint="Сильные стороны объекта для продажи и презентации">
          <ChipGroup
            options={rules.amenityOptions}
            values={values.amenities}
            onToggle={(value) => toggleArrayValue('amenities', value)}
          />
        </FieldShell>

        <section className="grid gap-3 md:grid-cols-2">
          <FieldShell label="Размер комиссии" required>
            <div className="group/commission space-y-3">
              <Select value={values.commissionPercent} onValueChange={(value) => updateValue('commissionPercent', value)}>
                <SelectTrigger className={SELECT_CLASS}>
                  <SelectValue placeholder="Выберите комиссию" />
                </SelectTrigger>
                <SelectContent>
                  {COMMISSION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-[12px] text-[rgba(242,207,141,0.52)]">
                Наведите, чтобы увидеть, как комиссия влияет на интерес агентов.
              </div>

              <div className="pointer-events-none max-h-0 overflow-hidden rounded-[18px] border border-[rgba(242,207,141,0.12)] bg-[rgba(255,255,255,0.04)] opacity-0 transition-all duration-200 group-hover/commission:pointer-events-auto group-hover/commission:max-h-[420px] group-hover/commission:p-4 group-hover/commission:opacity-100 group-focus-within/commission:pointer-events-auto group-focus-within/commission:max-h-[420px] group-focus-within/commission:p-4 group-focus-within/commission:opacity-100">
                <div className="text-[12px] font-semibold text-[#fcecc8]">Рекомендации по выбору комиссии</div>
                <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-[rgba(242,207,141,0.76)]">
                  {COMMISSION_OPTIONS.map((option) => (
                    <div key={option.value}>
                      <span className="font-semibold text-[#fcecc8]">{option.label}</span>
                      <span className="text-[rgba(242,207,141,0.66)]">. {option.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FieldShell>

          <FieldShell label="Продавец" required>
            <div className="grid gap-3 md:grid-cols-3">
              {SELLER_OPTIONS.map((option) => (
                <ChoiceTile
                  key={option.value}
                  active={values.sellerType === option.value}
                  title={option.label}
                  onClick={() => updateValue('sellerType', option.value as SellerType)}
                />
              ))}
            </div>
          </FieldShell>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <FieldShell label="Ипотека">
            <BinaryFlagField
              value={values.mortgageAvailable}
              onChange={(flag) => updateValue('mortgageAvailable', flag)}
              trueLabel="Доступна"
              falseLabel="Нет"
            />
          </FieldShell>

          <FieldShell label="Рассрочка">
            <BinaryFlagField
              value={values.installmentAvailable}
              onChange={(flag) => updateValue('installmentAvailable', flag)}
              trueLabel="Доступна"
              falseLabel="Нет"
            />
          </FieldShell>
        </section>
      </div>
    )
  }

  function renderStepContent() {
    if (currentStep.id === 'format') return renderFormatStep()
    if (currentStep.id === 'base') return renderBaseStep()
    if (currentStep.id === 'location') return renderLocationStep()
    if (currentStep.id === 'specs') return renderSpecsStep()
    return renderDealStep()
  }

  const currentStepIssues = stepErrors[currentStep.id]
  const primaryActionLabel = mode === 'create' ? 'Добавить объект' : 'Сохранить изменения'
  const pageTitle = mode === 'create' ? 'Новый объект' : 'Редактирование объекта'
  const progressLabel = `${completedCount} из ${PROPERTY_WIZARD_STEPS.length} шагов готовы`
  const progressPercent = Math.max(8, Math.round((completedCount / PROPERTY_WIZARD_STEPS.length) * 100))
  const previewProperty = useMemo(
    () => buildPropertyFromWizard(values, actor, property ?? undefined),
    [values, actor, property],
  )
  const previewPriceLabel = previewProperty.details?.priceOnRequest
    ? 'Цена по запросу'
    : `$${formatPrice(previewProperty.price)}`
  const previewPricePerM2Label = previewProperty.details?.priceOnRequest || previewProperty.pricePerM2 <= 0
    ? 'Прайс показывается по запросу'
    : `$${formatPrice(previewProperty.pricePerM2)} за м²`
  const previewFacts = [
    {
      label: previewProperty.rooms > 0 ? 'Комнаты' : 'Тип',
      value: previewProperty.rooms > 0 ? `${previewProperty.rooms}+1` : previewProperty.type,
    },
    {
      label: previewProperty.floor > 0 ? 'Этаж' : 'Этажность',
      value: previewProperty.floor > 0
        ? `${previewProperty.floor} из ${previewProperty.totalFloors || '—'}`
        : previewProperty.totalFloors > 0
          ? `${previewProperty.totalFloors}`
          : '—',
    },
    {
      label: 'Площадь',
      value: previewProperty.area > 0 ? `${previewProperty.area} м²` : '—',
    },
  ]
  const statusLabel = SALE_STATUS_OPTIONS.find((option) => option.value === values.status)?.label ?? 'Статус не выбран'
  const stepBadgeLabel = `Шаг ${activeStepIndex + 1} из ${PROPERTY_WIZARD_STEPS.length}`

  function handleContinue() {
    if (activeStepIndex < PROPERTY_WIZARD_STEPS.length - 1) {
      setActiveStepIndex((index) => Math.min(PROPERTY_WIZARD_STEPS.length - 1, index + 1))
      return
    }

    handlePrimarySave()
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="top-[50%] h-[calc(100vh-24px)] w-[calc(100vw-10px)] max-w-none border-none bg-transparent p-0 shadow-none sm:top-[50%] sm:h-[calc(100vh-28px)] sm:w-[calc(100vw-20px)] sm:max-w-none xl:w-[calc(100vw-32px)]"
      >
        <div className="relative h-full overflow-hidden rounded-[28px] border border-[rgba(242,207,141,0.16)] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_42%),linear-gradient(180deg,_rgba(9,36,28,0.985),_rgba(6,20,16,0.98))] text-[#fcecc8] shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
          <div className="grid h-full lg:grid-cols-[212px_minmax(0,1fr)] xl:grid-cols-[212px_minmax(0,1fr)_272px]">
            <aside className="flex min-h-0 flex-col border-b border-[rgba(242,207,141,0.1)] bg-[linear-gradient(180deg,_rgba(8,30,23,0.94),_rgba(7,24,19,0.9))] p-3 lg:border-r lg:border-b-0 xl:p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-semibold leading-[1.05] text-[#fcecc8]">{pageTitle}</h2>
                  <p className="mt-1 text-[12px] leading-snug text-[rgba(242,207,141,0.48)]">
                    Пошаговая сборка карточки.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-[rgba(242,207,141,0.12)] bg-[rgba(242,207,141,0.05)] p-1.5 text-[rgba(242,207,141,0.72)] transition-colors hover:text-[#fcecc8]"
                >
                  <X className="size-3" />
                </button>
              </div>

              <div className="mt-2.5">
                <div className="h-1 rounded-full bg-[rgba(242,207,141,0.08)]">
                  <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="mt-1 text-[13px] font-medium text-[#fcecc8]">{progressLabel}</div>
                <div className="mt-0.5 text-[12px] leading-snug text-[rgba(242,207,141,0.52)]">
                  {currentStepIssues.length > 0 ? `${currentStepIssues.length} поля требуют внимания.` : 'Текущий шаг заполнен.'}
                </div>
              </div>

              <div className="mt-2.5 space-y-1.5">
                {PROPERTY_WIZARD_STEPS.map((step, index) => {
                  const Icon = STEP_ICONS[step.id]
                  const active = index === activeStepIndex
                  const completed = stepErrors[step.id].length === 0
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStepIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-[14px] border px-2 py-1.5 text-left transition-all',
                        active
                          ? 'border-emerald-400/60 bg-emerald-400/12'
                          : 'border-[rgba(242,207,141,0.1)] bg-[rgba(5,20,16,0.26)] hover:border-[rgba(242,207,141,0.24)]',
                      )}
                    >
                        <div
                          className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                          active
                            ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-300'
                            : 'border-[rgba(242,207,141,0.12)] bg-[rgba(242,207,141,0.04)] text-[rgba(242,207,141,0.7)]',
                          )}
                        >
                         {completed ? <Check className="size-3" /> : index + 1}
                        </div>
                       <div className="min-w-0 flex-1">
                         <div className="flex min-w-0 items-center gap-1.5">
                           <Icon className={cn('size-3.5 shrink-0', active ? 'text-emerald-300' : 'text-[rgba(242,207,141,0.58)]')} />
                           <span className="truncate text-[13px] font-semibold leading-snug text-[#fcecc8]">{step.title}</span>
                         </div>
                       </div>
                     </button>
                  )
                })}
              </div>
            </aside>

            <section className="flex min-h-0 flex-col">
              <div className="border-b border-[rgba(242,207,141,0.1)] px-4 py-3 xl:px-5 xl:py-3.5">
                <DialogHeader className="text-left">
                  <div className="inline-flex w-fit items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    {stepBadgeLabel}
                  </div>
                  <DialogTitle className="min-w-0 break-words text-[22px] leading-tight text-[#fcecc8]">{currentStep.title}</DialogTitle>
                </DialogHeader>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 xl:px-5 xl:py-4">
                <div className="mx-auto w-full max-w-[1040px]">
                  {renderStepContent()}
                </div>
              </div>

              <div className="border-t border-[rgba(242,207,141,0.1)] px-4 pb-4 pt-2.5 xl:px-5 xl:pb-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="h-10 rounded-full border-[rgba(242,207,141,0.18)] bg-transparent px-4 text-[12px] text-[rgba(242,207,141,0.78)] hover:bg-[rgba(242,207,141,0.08)] hover:text-[#fcecc8]"
                    >
                      Отмена
                    </Button>

                    {mode === 'create' && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveDraft}
                          className="h-10 rounded-full border-[rgba(242,207,141,0.18)] bg-transparent px-4 text-[12px] text-[rgba(242,207,141,0.78)] hover:bg-[rgba(242,207,141,0.08)] hover:text-[#fcecc8]"
                      >
                        <FileStack className="size-4" />
                        Сохранить черновик
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveStepIndex((index) => Math.max(0, index - 1))}
                      disabled={activeStepIndex === 0}
                      className="h-10 rounded-full border-[rgba(242,207,141,0.18)] bg-transparent px-4 text-[12px] text-[rgba(242,207,141,0.78)] hover:bg-[rgba(242,207,141,0.08)] hover:text-[#fcecc8]"
                    >
                      <ChevronLeft className="size-4" />
                      Шаг назад
                    </Button>

                    <Button
                      type="button"
                      onClick={handleContinue}
                      className="h-10 rounded-full bg-emerald-500 px-6 text-[12px] text-white hover:bg-emerald-400"
                    >
                      {activeStepIndex < PROPERTY_WIZARD_STEPS.length - 1 ? (
                        <>
                          Далее
                          <ChevronRight className="size-4" />
                        </>
                      ) : (
                        <>
                          {mode === 'edit' ? <Home className="size-4" /> : <Building2 className="size-4" />}
                          {canSubmit ? primaryActionLabel : 'Перейти к незаполненному шагу'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <aside className="hidden min-h-0 flex-col border-l border-[rgba(242,207,141,0.1)] bg-[linear-gradient(180deg,_rgba(10,31,24,0.9),_rgba(7,23,18,0.94))] p-4 xl:flex">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[rgba(242,207,141,0.34)]">Preview</div>
                <h3 className="mt-1.5 text-[18px] font-semibold leading-[1.05] text-[#fcecc8]">Черновик объявления</h3>
              </div>

              <div className="mt-3 flex-1 overflow-y-auto">
                <div className="rounded-[20px] border border-[rgba(242,207,141,0.12)] bg-[rgba(242,207,141,0.04)] p-3.5">
                  <div className="overflow-hidden rounded-[18px] border border-[rgba(242,207,141,0.12)] bg-[rgba(255,255,255,0.04)]">
                    {previewProperty.photo ? (
                      <img src={previewProperty.photo} alt={previewProperty.title} className="aspect-[4/3] w-full object-cover" />
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_58%),linear-gradient(180deg,_rgba(11,31,24,0.92),_rgba(8,25,19,0.92))] text-[rgba(242,207,141,0.36)]">
                        <Upload className="size-6" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-[rgba(242,207,141,0.12)] bg-[rgba(5,20,16,0.46)] px-2.5 py-1 text-[11px] text-[#fcecc8]">
                      {PROPERTY_CATEGORY_OPTIONS.find((option) => option.value === values.category)?.label}
                    </span>
                    <span className="rounded-full border border-[rgba(242,207,141,0.12)] bg-[rgba(5,20,16,0.46)] px-2.5 py-1 text-[11px] text-[#fcecc8]">
                      {values.type}
                    </span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300">
                      {statusLabel}
                    </span>
                  </div>

                  <div className="mt-3 text-[22px] font-semibold leading-none text-emerald-300">{previewPriceLabel}</div>
                  <div className="mt-1 text-[11px] leading-snug text-[rgba(242,207,141,0.48)]">{previewPricePerM2Label}</div>

                  <div className="mt-3 line-clamp-3 text-[16px] font-semibold leading-snug text-[#fcecc8]">
                    {previewProperty.title}
                  </div>

                  <div className="mt-2.5 space-y-1 text-[11px] text-[rgba(242,207,141,0.7)]">
                    {values.mapLocationLabel.trim() && <div className="line-clamp-1 text-emerald-300">{values.mapLocationLabel}</div>}
                    <div className="line-clamp-2">{previewProperty.street}</div>
                    <div className="line-clamp-1">{previewProperty.city}, {previewProperty.country}</div>
                  </div>

                  {values.description.trim() && (
                    <div className="mt-2.5 line-clamp-3 text-[11px] leading-relaxed text-[rgba(242,207,141,0.46)]">
                      {values.description}
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-[rgba(242,207,141,0.08)] pt-2.5">
                    {previewFacts.map((item) => (
                      <div key={item.label} className="min-w-0 rounded-[14px] border border-[rgba(242,207,141,0.08)] bg-[rgba(5,20,16,0.34)] p-2">
                        <div className="truncate text-[10px] tracking-[0.08em] text-[rgba(242,207,141,0.34)]">{item.label}</div>
                        <div className="mt-1 truncate text-[12px] font-semibold text-[#fcecc8]">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {isMapModalOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(3,10,8,0.72)] p-4 backdrop-blur-sm">
              <div className="flex h-full max-h-[760px] w-full max-w-[980px] flex-col overflow-hidden rounded-[30px] border border-[rgba(242,207,141,0.16)] bg-[linear-gradient(180deg,_rgba(9,34,27,0.98),_rgba(6,20,16,0.98))] shadow-[0_28px_80px_rgba(0,0,0,0.5)]">
                <div className="flex items-start justify-between gap-4 border-b border-[rgba(242,207,141,0.1)] px-5 py-4">
                  <div>
                    <div className="text-[18px] font-semibold text-[#fcecc8]">Карта локации</div>
                    <div className="mt-1 text-[13px] text-[rgba(242,207,141,0.48)]">
                      Открой карту и поставь точку кликом.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(false)}
                    className="rounded-full border border-[rgba(242,207,141,0.12)] bg-[rgba(242,207,141,0.05)] p-1.5 text-[rgba(242,207,141,0.72)] transition-colors hover:text-[#fcecc8]"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="border-b border-[rgba(242,207,141,0.1)] bg-[rgba(5,20,16,0.24)] p-5 lg:border-r lg:border-b-0">
                    <div className="rounded-[20px] border border-[rgba(242,207,141,0.12)] bg-[rgba(5,20,16,0.36)] p-4">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[rgba(242,207,141,0.34)]">Текущая точка</div>
                      <div className="mt-2 text-[15px] font-semibold text-[#fcecc8]">{mapLocationLabel}</div>
                      <div className="mt-1 text-[12px] text-[rgba(242,207,141,0.46)]">{mapCoordinatesLabel}</div>
                    </div>
                    <div className="mt-4 grid gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => applyMapSelection(50, 50, `${values.city}, центр`)}
                        className="h-10 rounded-full border-[rgba(242,207,141,0.18)] bg-transparent px-4 text-[12px] text-[rgba(242,207,141,0.78)] hover:bg-[rgba(242,207,141,0.08)] hover:text-[#fcecc8]"
                      >
                        <Crosshair className="size-4" />
                        Поставить в центр города
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsMapModalOpen(false)}
                        className="h-10 rounded-full border-emerald-400/30 bg-emerald-400/10 px-4 text-[12px] text-emerald-300 hover:bg-emerald-400/16 hover:text-emerald-200"
                      >
                        Готово
                      </Button>
                    </div>
                  </div>

                  <div className="min-h-0 p-5">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={handleMapCanvasClick}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          applyMapSelection(50, 50, `${values.city}, центр`)
                        }
                      }}
                      className="relative h-full min-h-[360px] cursor-crosshair overflow-hidden rounded-[26px] border border-[rgba(242,207,141,0.12)] outline-none"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 24% 22%, rgba(16,185,129,0.22), transparent 26%), radial-gradient(circle at 73% 64%, rgba(242,207,141,0.14), transparent 24%), linear-gradient(180deg, rgba(8,28,22,0.96), rgba(6,20,16,0.96)), linear-gradient(rgba(242,207,141,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(242,207,141,0.05) 1px, transparent 1px)',
                        backgroundSize: 'auto, auto, auto, 32px 32px, 32px 32px',
                      }}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,_transparent_0%,_rgba(255,255,255,0.02)_50%,_transparent_100%)]" />
                      <div className="absolute left-4 top-4 rounded-full border border-[rgba(242,207,141,0.12)] bg-[rgba(5,20,16,0.46)] px-3 py-1 text-[11px] text-[rgba(242,207,141,0.62)]">
                        {values.country} / {values.city}
                      </div>
                      <div className="absolute right-4 top-4 rounded-full border border-[rgba(242,207,141,0.12)] bg-[rgba(5,20,16,0.46)] px-3 py-1 text-[11px] text-[rgba(242,207,141,0.62)]">
                        Клик по карте ставит точку
                      </div>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="rounded-[24px] border border-dashed border-[rgba(242,207,141,0.22)] bg-[rgba(5,20,16,0.42)] px-8 py-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                          <div className="text-[22px] font-semibold tracking-[0.08em] text-[#fcecc8]">МЕСТО ПОД КАРТУ</div>
                        </div>
                      </div>
                      {selectedMapPoint && (
                        <div
                          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full text-emerald-300"
                          style={{ left: `${selectedMapPoint.x}%`, top: `${selectedMapPoint.y}%` }}
                        >
                          <div className="relative flex flex-col items-center">
                            <MapPin className="size-8 fill-current drop-shadow-[0_6px_18px_rgba(16,185,129,0.35)]" />
                            <div className="mt-1 rounded-full border border-emerald-400/30 bg-[rgba(5,20,16,0.8)] px-2.5 py-1 text-[11px] font-medium text-[#fcecc8]">
                              {mapLocationLabel}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
