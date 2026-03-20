import type { MailingLink } from '@/types/mailings'
import { cn } from '@/lib/utils'

interface MailingPreviewProps {
  title: string
  body: string
  links: MailingLink[]
  imageUrl?: string
  fileUrl?: string
  fileName?: string
  variant: 'crm' | 'cabinet'
  className?: string
}

/** Отображение рассылки как для адресата: крупный читаемый текст (text-readable-*), высокий контраст. */
export function MailingPreview({
  title,
  body,
  links,
  imageUrl,
  fileUrl,
  fileName,
  variant,
  className,
}: MailingPreviewProps) {
  const filteredLinks = links.filter((l) => l.url.trim())
  const isCrm = variant === 'crm'

  return (
    <div
      className={cn(
        'rounded-xl border p-5',
        isCrm ? 'border-slate-200 bg-slate-50/50' : 'border-primary/20 bg-primary/5',
        className
      )}
    >
      <div className="space-y-4">
        <h3 className="text-readable-lg font-semibold text-high-contrast">
          {title || 'Без названия'}
        </h3>
        <div
          className="text-readable-base text-muted-high-contrast prose prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 max-w-none"
          dangerouslySetInnerHTML={{ __html: body || '<p>Нет текста</p>' }}
        />
        {filteredLinks.length > 0 && (
          <div className="space-y-2">
            <p className="text-readable-sm font-medium text-high-contrast">Ссылки:</p>
            <ul className="space-y-1.5">
              {filteredLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-readable-base text-primary underline hover:no-underline"
                  >
                    {link.label?.trim() || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {imageUrl && (
          <div>
            <img
              src={imageUrl}
              alt=""
              className="max-h-48 rounded-md border border-input object-contain"
            />
          </div>
        )}
        {fileUrl && fileName && (
          <div className="flex items-center gap-2 rounded-md border border-input bg-muted/30 px-3 py-2">
            <span className="text-readable-sm font-medium text-high-contrast">{fileName}</span>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-readable-sm text-primary underline"
            >
              Скачать
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
