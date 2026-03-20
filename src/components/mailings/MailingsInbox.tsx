import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MailingPreview } from './MailingPreview'
import type { Mailing } from '@/types/mailings'

interface MailingsInboxProps {
  mailings: Mailing[]
  variant: 'crm' | 'cabinet'
  title?: string
  description?: string
}

const sentMailings = (mailings: Mailing[]) => mailings.filter((m) => m.sentAt)

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

export function MailingsInbox({
  mailings,
  variant,
  title = 'Оповещения',
  description,
}: MailingsInboxProps) {
  const sent = sentMailings(mailings)
  if (sent.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-readable-sm text-high-contrast">{title}</CardTitle>
        {description && (
          <p className="text-readable-xs text-muted-high-contrast">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {sent.map((m) => (
          <div key={m.id} className="space-y-1">
            <p className="text-readable-xs text-muted-high-contrast">{formatDate(m.sentAt!)}</p>
            <MailingPreview
              title={m.title}
              body={m.body}
              links={m.links}
              imageUrl={m.imageUrl}
              fileUrl={m.fileUrl}
              fileName={m.fileName}
              variant={variant}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
