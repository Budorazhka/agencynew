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
        isCrm
          ? 'border-[var(--green-border)] bg-[var(--green-deep)]'
          : 'border-[rgba(201,168,76,0.35)] bg-[color-mix(in_srgb,var(--green-deep)_92%,var(--gold)_8%)]',
        className
      )}
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[color:var(--app-text)]">
          {title || 'Без названия'}
        </h3>
        <div
          className="max-w-none text-base leading-relaxed text-[color:var(--app-text-muted)] [&_a]:text-[color:var(--theme-accent-heading)] [&_li]:my-0.5 [&_p]:my-2 [&_ul]:my-2"
          dangerouslySetInnerHTML={{ __html: body || '<p>Нет текста</p>' }}
        />
        {filteredLinks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[color:var(--app-text)]">Ссылки:</p>
            <ul className="space-y-1.5">
              {filteredLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-[color:var(--theme-accent-heading)] underline hover:no-underline"
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
              className="max-h-48 rounded-md border border-[var(--green-border)] object-contain"
            />
          </div>
        )}
        {fileUrl && fileName && (
          <div className="flex items-center gap-2 rounded-md border border-[var(--green-border)] bg-[var(--green-card)] px-3 py-2">
            <span className="text-sm font-medium text-[color:var(--app-text)]">{fileName}</span>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[color:var(--theme-accent-heading)] underline"
            >
              Скачать
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
