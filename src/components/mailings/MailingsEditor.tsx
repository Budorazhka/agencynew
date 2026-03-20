import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmationDialog } from '@/components/management/ConfirmationDialog'
import { AudienceSelector, getRecipientCount, type AudienceState } from './AudienceSelector'
import { MailingPreview } from './MailingPreview'
import { LinkListEditor } from './LinkListEditor'
import { RichTextEditor } from './RichTextEditor'
import { ImageUpload } from './ImageUpload'
import { FileUpload, type FileUploadValue } from './FileUpload'
import type { City, Country, Partner } from '@/types/dashboard'
import type { Mailing, MailingLink } from '@/types/mailings'

interface MailingsEditorProps {
  city: City
  country?: Country
  cities: City[]
  allPartners: Partner[]
  mailings: Mailing[]
  onAddMailing: (mailing: Mailing) => void
  onCancelScheduled: (mailingId: string) => void
}

/** Редактор рассылок. Пока показываем всем на странице города; TODO: ограничить по праву notifications при появлении авторизации. */
export function MailingsEditor({
  city,
  country,
  cities,
  allPartners,
  mailings,
  onAddMailing,
  onCancelScheduled,
}: MailingsEditorProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [links, setLinks] = useState<MailingLink[]>([{ url: '', label: '' }])
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [fileValue, setFileValue] = useState<FileUploadValue | undefined>()
  const [audienceState, setAudienceState] = useState<AudienceState>(() => ({
    audience: 'all_partners',
    scope: 'city',
    scopeCityId: city.id,
    scopeCountryId: country?.id ?? '',
    selectedPartnerIds: [],
    channels: ['crm', 'cabinet'],
  }))
  const [sendNow, setSendNow] = useState(true)
  const [scheduledAt, setScheduledAt] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const recipientCount = useMemo(
    () =>
      getRecipientCount(
        audienceState.audience,
        audienceState.scope,
        audienceState.scopeCityId,
        audienceState.scopeCountryId,
        audienceState.selectedPartnerIds,
        city,
        cities,
        allPartners
      ),
    [audienceState, city, cities, allPartners]
  )

  const channelLabels = audienceState.channels.map((ch) => (ch === 'crm' ? 'CRM' : 'личный кабинет')).join(' и в ')
  const confirmMessage = `Отправить оповещение ${recipientCount} получателям в ${channelLabels}?`

  const scopeLabel = (m: Mailing): string => {
    if (m.audience === 'selected') return `Выбрано ${m.selectedPartnerIds?.length ?? 0}`
    if (m.audience === 'all_network') return 'Вся сеть'
    if (m.scope === 'city') return 'Город'
    if (m.scope === 'country') return 'Страна'
    return 'Мир'
  }
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
  }

  const handleSubmitClick = () => {
    if (audienceState.channels.length === 0) return
    if (!sendNow && !scheduledAt.trim()) return
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    const now = new Date().toISOString()
    const linksFiltered = links.filter((l) => l.url.trim())
    const mailing: Mailing = {
      id: `mailing-${Date.now()}`,
      title: title.trim() || 'Без названия',
      body: body || '',
      links: linksFiltered,
      imageUrl,
      fileUrl: fileValue?.url,
      fileName: fileValue?.fileName,
      channels: audienceState.channels,
      audience: audienceState.audience,
      scope: audienceState.scope,
      scopeCityId: audienceState.scopeCityId,
      scopeCountryId: audienceState.scopeCountryId,
      selectedPartnerIds: audienceState.selectedPartnerIds.length > 0 ? audienceState.selectedPartnerIds : undefined,
      scheduledAt: sendNow ? null : scheduledAt ? new Date(scheduledAt).toISOString() : null,
      sentAt: sendNow ? now : null,
      createdAt: now,
    }
    onAddMailing(mailing)
    setConfirmOpen(false)
    setTitle('')
    setBody('')
    setLinks([{ url: '', label: '' }])
    setImageUrl(undefined)
    setFileValue(undefined)
    setScheduledAt('')
  }

  return (
    <>
    <Card>
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-xl">Редактор рассылок</CardTitle>
        <CardDescription className="text-base">
          Новости, оповещения и маркетинговые рассылки — в CRM и в личный кабинет
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="mailing-title" className="text-base">
            Название оповещения
          </Label>
          <Input
            id="mailing-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название"
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base">Текст оповещения</Label>
          <RichTextEditor
            value={body}
            onChange={setBody}
            placeholder="Введите текст (можно форматировать: жирный, списки...)"
          />
        </div>

        <LinkListEditor links={links} onChange={setLinks} />

        <Separator />

        <ImageUpload value={imageUrl} onChange={setImageUrl} />
        <FileUpload value={fileValue} onChange={setFileValue} />

        <Separator />

        <AudienceSelector
          city={city}
          country={country}
          cities={cities}
          allPartners={allPartners}
          value={audienceState}
          onChange={setAudienceState}
        />

        <Separator />

        <div className="space-y-3">
          <Label className="text-base">Когда отправить</Label>
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="when"
                checked={sendNow}
                onChange={() => setSendNow(true)}
                className="size-4"
              />
              <span className="text-base">Отправить сейчас</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="when"
                checked={!sendNow}
                onChange={() => setSendNow(false)}
                className="size-4"
              />
              <span className="text-base">Запланировать</span>
            </label>
            {!sendNow && (
              <div className="ml-6">
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="max-w-xs text-base"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
            Предпросмотр
          </Button>
          <Button
            type="button"
            onClick={handleSubmitClick}
            disabled={audienceState.channels.length === 0 || (!sendNow && !scheduledAt.trim())}
          >
            {sendNow ? 'Отправить' : 'Запланировать'}
          </Button>
        </div>
      </CardContent>
    </Card>

    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Предпросмотр рассылки</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Как в CRM</p>
            <MailingPreview
              title={title}
              body={body || ''}
              links={links.filter((l) => l.url.trim())}
              imageUrl={imageUrl}
              fileUrl={fileValue?.url}
              fileName={fileValue?.fileName}
              variant="crm"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Как в личном кабинете</p>
            <MailingPreview
              title={title}
              body={body || ''}
              links={links.filter((l) => l.url.trim())}
              imageUrl={imageUrl}
              fileUrl={fileValue?.url}
              fileName={fileValue?.fileName}
              variant="cabinet"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <ConfirmationDialog
      open={confirmOpen}
      title={sendNow ? 'Отправить рассылку?' : 'Запланировать рассылку?'}
      description={confirmMessage}
      onConfirm={handleConfirm}
      onCancel={() => setConfirmOpen(false)}
    />

    {mailings.length > 0 && (
      <Card className="mt-8">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-xl">История рассылок</CardTitle>
          <CardDescription className="text-base">Отправленные и запланированные рассылки</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mailings.map((m) => {
              const isScheduled = m.scheduledAt && !m.sentAt
              return (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{m.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(m.createdAt)}
                      {' · '}
                      {scopeLabel(m)}
                      {' · '}
                      {m.channels.map((ch) => (ch === 'crm' ? 'CRM' : 'ЛК')).join(', ')}
                    </p>
                    {isScheduled && m.scheduledAt && (
                      <p className="mt-1 text-sm text-amber-700">
                        Запланировано на {formatDate(m.scheduledAt)}
                      </p>
                    )}
                  </div>
                  {isScheduled && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onCancelScheduled(m.id)}
                    >
                      Отменить
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )}
  </>
  )
}
