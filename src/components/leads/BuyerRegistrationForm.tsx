import { useState } from 'react'
import { X, FileText, Download } from 'lucide-react'
import { useLeads } from '@/context/LeadsContext'
import type { Lead } from '@/types/leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function BuyerRegistrationForm({
  lead,
  onClose,
}: {
  lead: Lead
  onClose: () => void
}) {
  const { dispatch } = useLeads()
  const [clientName, setClientName] = useState(lead.name ?? '')
  const [projectName, setProjectName] = useState('')
  const [developerName, setDeveloperName] = useState('')
  const [managerName, setManagerName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id = `reg-${Date.now()}`
    const registration = {
      id,
      clientName: clientName.trim(),
      projectName: projectName.trim(),
      developerName: developerName.trim(),
      managerName: managerName.trim(),
      date,
    }

    dispatch({ type: 'ADD_BUYER_REGISTRATION', leadId: lead.id, registration })
    dispatch({
      type: 'ADD_LEAD_EVENT',
      leadId: lead.id,
      event: {
        id: `evt-${Date.now()}`,
        type: 'buyer_registration',
        timestamp: new Date().toISOString(),
        authorId: 'current-user',
        authorName: 'Вы',
        payload: { registrationData: registration },
      },
    })

    onClose()
  }

  function handleDownloadTemplate() {
    // Заглушка — в боевой версии здесь генерация .docx через бэкенд или docx-пакет
    const content = `АКТ ОСМОТРА ОБЪЕКТА НЕДВИЖИМОСТИ\n\nДата: ${date}\nКлиент: ${clientName}\nЖК / Объект: ${projectName}\nЗастройщик: ${developerName}\nМенеджер: ${managerName}\n\n_________________________\nПодпись клиента\n\n_________________________\nПодпись менеджера\n\n_________________________\nПодпись представителя застройщика`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Акт_осмотра_${clientName || 'клиент'}_${projectName || 'объект'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="rounded-xl border-2 border-[rgba(195,165,100,0.5)] bg-[#fdf8f0] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0d3d2f]" />
          <h3 className="text-sm font-semibold text-slate-800">Регистрация покупателя</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">Имя клиента</Label>
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Иван Петров"
            className="h-8 text-sm bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">ЖК / Объект</Label>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="ЖК «Солнечный»"
            className="h-8 text-sm bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">Застройщик</Label>
          <Input
            value={developerName}
            onChange={(e) => setDeveloperName(e.target.value)}
            placeholder="ООО «СтройГрупп»"
            className="h-8 text-sm bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">Менеджер</Label>
          <Input
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            placeholder="Иванова Мария"
            className="h-8 text-sm bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">Дата показа</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 text-sm bg-white border-slate-200 text-slate-900"
            required
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            size="sm"
            className="flex-1 bg-[#0d3d2f] hover:bg-[#0a2f24] text-white"
            disabled={!clientName.trim() || !projectName.trim()}
          >
            Зарегистрировать
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1 border-slate-300 text-slate-700 hover:bg-slate-100 bg-white"
            onClick={handleDownloadTemplate}
          >
            <Download className="w-3.5 h-3.5" />
            .txt
          </Button>
        </div>
      </form>
    </div>
  )
}
