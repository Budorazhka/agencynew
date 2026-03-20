import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserRound, Clock } from 'lucide-react'

export function RealtorOnboarding() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center">
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="size-4" />
          Назад
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          <div className="size-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <UserRound className="size-10 text-blue-500" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="size-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Скоро</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Онбординг риэлтора</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Раздел для независимых риэлторов находится в разработке. Оставьте email — мы уведомим о запуске.
          </p>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-700 font-medium rounded-xl transition-colors text-sm"
          >
            Вернуться к выбору типа
          </button>
        </div>
      </div>
    </div>
  )
}
