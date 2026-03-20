import { useState } from 'react'
import { Upload, Check } from 'lucide-react'

function FeltInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[rgba(242,207,141,0.55)] uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.25)] px-4 py-2.5 text-sm text-[#fcecc8] placeholder:text-[rgba(242,207,141,0.3)] outline-none focus:border-[rgba(242,207,141,0.5)] focus:ring-1 focus:ring-[rgba(242,207,141,0.2)] transition-all"
      />
    </div>
  )
}

export function CompanyTab() {
  const [name,    setName]    = useState('Агентство Недвижимости Премьер')
  const [legal,   setLegal]   = useState('ООО «Премьер»')
  const [inn,     setInn]     = useState('7712345678')
  const [address, setAddress] = useState('г. Москва, ул. Тверская, 12')
  const [site,    setSite]    = useState('premier-estate.ru')
  const [phone,   setPhone]   = useState('+7 (495) 123-45-67')
  const [saved,   setSaved]   = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-8 max-w-xl">
      {/* Logo upload */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[rgba(242,207,141,0.55)]">Логотип компании</p>
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-2xl border-2 border-dashed border-[rgba(242,207,141,0.25)] bg-[rgba(242,207,141,0.05)] text-2xl font-bold text-[rgba(242,207,141,0.4)]">
            П
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-[rgba(242,207,141,0.2)] px-4 py-2 text-sm font-medium text-[rgba(242,207,141,0.7)] hover:border-[rgba(242,207,141,0.4)] hover:text-[#fcecc8] transition-colors">
            <Upload className="size-4" />
            Загрузить логотип
          </button>
          <p className="text-xs text-[rgba(242,207,141,0.3)]">PNG, JPG до 2 МБ</p>
        </div>
      </div>

      {/* Company fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FeltInput label="Название компании" value={name} onChange={setName} placeholder="ООО «Название»" />
        </div>
        <FeltInput label="Юридическое название" value={legal} onChange={setLegal} placeholder="ООО «Полное название»" />
        <FeltInput label="ИНН" value={inn} onChange={setInn} placeholder="7712345678" />
        <div className="sm:col-span-2">
          <FeltInput label="Адрес офиса" value={address} onChange={setAddress} placeholder="г. Город, ул. Улица, д. 1" />
        </div>
        <FeltInput label="Сайт" value={site} onChange={setSite} placeholder="example.ru" />
        <FeltInput label="Телефон компании" value={phone} onChange={setPhone} type="tel" placeholder="+7 (___) ___-__-__" />
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
      >
        {saved ? <><Check className="size-4" /> Сохранено</> : 'Сохранить'}
      </button>
    </div>
  )
}
