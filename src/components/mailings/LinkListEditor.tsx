import { HelpCircle, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { MailingLink } from '@/types/mailings'
import { cn } from '@/lib/utils'

interface LinkListEditorProps {
  links: MailingLink[]
  onChange: (links: MailingLink[]) => void
  className?: string
}

export function LinkListEditor({ links, onChange, className }: LinkListEditorProps) {
  const addLink = () => {
    onChange([...links, { url: '', label: '' }])
  }

  const updateLink = (index: number, patch: Partial<MailingLink>) => {
    const base = links.length === 0 ? [{ url: '', label: '' }] : links
    const next = base.map((l, i) => (i === index ? { ...l, ...patch } : l))
    onChange(next)
  }

  const removeLink = (index: number) => {
    if (links.length <= 1) {
      onChange([{ url: '', label: '' }])
    } else {
      onChange(links.filter((_, i) => i !== index))
    }
  }

  const displayLinks = links.length === 0 ? [{ url: '', label: '' }] : links

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-base">Ссылки</Label>
        <Button type="button" variant="outline" size="sm" onClick={addLink}>
          <Plus className="mr-1 size-4" />
          Добавить ссылку
        </Button>
      </div>
      {displayLinks.map((link, index) => (
        <div key={index} className="flex flex-wrap items-end gap-2 rounded-md border border-input p-3">
          <div className="min-w-0 flex-1 space-y-1">
            <Label className="text-sm">URL</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={link.url}
              onChange={(e) => updateLink(index, { url: e.target.value })}
              className="text-base"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm">Текст ссылки (опционально)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-help text-muted-foreground hover:text-foreground">
                    <HelpCircle className="size-4" aria-hidden />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px]">
                  Анкор — это видимый текст ссылки, по которому кликает получатель. Если не указать, в рассылке будет показан сам URL.
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              placeholder="Анкор"
              value={link.label ?? ''}
              onChange={(e) => updateLink(index, { label: e.target.value })}
              className="text-base"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeLink(index)}
            title="Удалить"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
