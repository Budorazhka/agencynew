import { useNavigate } from 'react-router-dom'
import { Building2, UserRound, HardHat, ArrowLeft, ArrowRight } from 'lucide-react'

const TYPES = [
  {
    icon: Building2,
    title: 'Агентство',
    description: 'Управление командой, лидами и аналитикой для агентства недвижимости',
    path: '/register/agency',
    badge: 'Старт здесь',
    badgeColor: 'bg-green-100 text-green-700',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
    border: 'border-green-300 hover:border-green-500',
  },
  {
    icon: UserRound,
    title: 'Риэлтор',
    description: 'Личный кабинет для независимого риэлтора',
    path: '/register/realtor',
    badge: null,
    badgeColor: '',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    border: 'border-gray-200 hover:border-blue-300',
  },
  {
    icon: HardHat,
    title: 'Застройщик',
    description: 'Управление объектами и партнёрскими продажами',
    path: '/register/developer',
    badge: 'Скоро',
    badgeColor: 'bg-amber-100 text-amber-700',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    border: 'border-gray-200 hover:border-amber-300',
  },
]

export function RegistrationSelector() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="size-4" />
          На главную
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Кто вы?</h1>
            <p className="text-gray-500">
              Выберите тип аккаунта — мы настроим платформу под ваши задачи
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TYPES.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.title}
                  type="button"
                  onClick={() => navigate(type.path)}
                  className={`relative bg-white rounded-2xl border-2 ${type.border} p-6 flex flex-col text-left transition-all duration-200 hover:shadow-md group`}
                >
                  {type.badge && (
                    <span className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold rounded-full ${type.badgeColor}`}>
                      {type.badge}
                    </span>
                  )}

                  <div className={`size-12 rounded-xl ${type.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`size-6 ${type.iconColor}`} />
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">{type.description}</p>

                  <div className="mt-4 flex items-center gap-1 text-green-600 text-sm font-medium group-hover:gap-2 transition-all">
                    Выбрать <ArrowRight className="size-4" />
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-green-600 hover:underline font-medium"
            >
              Войти
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
