import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Building2, User, Sparkles } from 'lucide-react'

type Step = 1 | 2 | 3

interface AgencyData {
  name: string
  country: string
  city: string
  size: string
}

interface AdminData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

const STEPS = [
  { id: 1, label: 'Агентство', icon: Building2 },
  { id: 2, label: 'Администратор', icon: User },
  { id: 3, label: 'Готово', icon: Sparkles },
]

const COUNTRIES = ['Россия', 'Грузия', 'Таиланд', 'Турция', 'ОАЭ', 'Кипр', 'Другая']
const SIZES = [
  { value: '1-5', label: '1–5 человек' },
  { value: '6-20', label: '6–20 человек' },
  { value: '21-50', label: '21–50 человек' },
  { value: '50+', label: 'Более 50' },
]

export function AgencyOnboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)

  const [agency, setAgency] = useState<AgencyData>({
    name: '',
    country: '',
    city: '',
    size: '',
  })
  const [admin, setAdmin] = useState<AdminData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!agency.name.trim()) e.name = 'Введите название агентства'
    if (!agency.country) e.country = 'Выберите страну'
    if (!agency.city.trim()) e.city = 'Введите город'
    if (!agency.size) e.size = 'Выберите размер команды'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (!admin.fullName.trim()) e.fullName = 'Введите имя и фамилию'
    if (!admin.email.trim() || !admin.email.includes('@')) e.email = 'Введите корректный email'
    if (admin.password.length < 8) e.password = 'Минимум 8 символов'
    if (admin.password !== admin.confirmPassword) e.confirmPassword = 'Пароли не совпадают'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  const inputCls = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
      errors[field]
        ? 'border-red-400 focus:border-red-500'
        : 'border-gray-200 focus:border-green-500'
    }`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={() => (step === 1 ? navigate('/register') : setStep((s) => (s - 1) as Step))}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="size-4" />
          {step === 1 ? 'Назад' : 'Предыдущий шаг'}
        </button>
        <span className="text-sm text-gray-400">Регистрация агентства</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          {/* Stepper */}
          <div className="flex items-center justify-center mb-10 gap-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const done = step > s.id
              const active = step === s.id
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`size-10 rounded-full flex items-center justify-center transition-all ${
                        done
                          ? 'bg-green-500 text-white'
                          : active
                            ? 'bg-green-500 text-white ring-4 ring-green-100'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {done ? <Check className="size-5" /> : <Icon className="size-5" />}
                    </div>
                    <span className={`text-xs font-medium ${active ? 'text-green-600' : done ? 'text-gray-600' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 mb-4 rounded ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step 1 — Agency */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Ваше агентство</h2>
              <p className="text-gray-500 text-sm mb-8">Расскажите немного о компании</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Название агентства <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputCls('name')}
                    placeholder="Например: Союз Недвижимости"
                    value={agency.name}
                    onChange={(e) => setAgency({ ...agency, name: e.target.value })}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Страна <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={inputCls('country') + ' bg-white'}
                      value={agency.country}
                      onChange={(e) => setAgency({ ...agency, country: e.target.value })}
                    >
                      <option value="">Выберите...</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Город <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={inputCls('city')}
                      placeholder="Батуми"
                      value={agency.city}
                      onChange={(e) => setAgency({ ...agency, city: e.target.value })}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Размер команды <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setAgency({ ...agency, size: s.value })}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          agency.size === s.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size}</p>}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
              >
                Далее
                <ArrowRight className="size-5" />
              </button>
            </div>
          )}

          {/* Step 2 — Admin */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Аккаунт администратора</h2>
              <p className="text-gray-500 text-sm mb-8">Это будет главный аккаунт агентства</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Имя и фамилия <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputCls('fullName')}
                    placeholder="Иван Иванов"
                    value={admin.fullName}
                    onChange={(e) => setAdmin({ ...admin, fullName: e.target.value })}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={inputCls('email')}
                    placeholder="admin@agency.ru"
                    value={admin.email}
                    onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Пароль <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    className={inputCls('password')}
                    placeholder="Минимум 8 символов"
                    value={admin.password}
                    onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Подтвердите пароль <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    className={inputCls('confirmPassword')}
                    placeholder="Повторите пароль"
                    value={admin.confirmPassword}
                    onChange={(e) => setAdmin({ ...admin, confirmPassword: e.target.value })}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
              >
                Завершить регистрацию
                <ArrowRight className="size-5" />
              </button>
            </div>
          )}

          {/* Step 3 — Success */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm text-center">
              <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Check className="size-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Агентство создано!</h2>
              <p className="text-gray-500 mb-2">
                <span className="font-semibold text-gray-700">{agency.name}</span> успешно зарегистрировано.
              </p>
              <p className="text-gray-400 text-sm mb-10">
                Войдите в дашборд, чтобы начать работу. Приглашения сотрудникам отправляются из раздела «Команда».
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Перейти в дашборд
                  <ArrowRight className="size-5" />
                </button>
                <p className="text-xs text-gray-400">
                  Авторизация: {admin.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
