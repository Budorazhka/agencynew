import { useRef, useEffect } from 'react'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

function execCommand(cmd: string, value?: string) {
  document.execCommand(cmd, false, value ?? undefined)
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const current = el.innerHTML.replace(/^<br\s*\/?>$/i, '')
    const next = value || ''
    if (current !== next) {
      el.innerHTML = next || ''
    }
  }, [value])

  const handleInput = () => {
    const html = ref.current?.innerHTML ?? ''
    onChange(html)
  }

  return (
    <div
      className={cn(
        'rounded-md border border-[var(--green-border)] bg-[var(--green-deep)]',
        className,
      )}
    >
      <div className="flex flex-wrap gap-1 border-b border-[var(--green-border)] p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[color:var(--app-text-muted)] hover:bg-[var(--dropdown-hover)] hover:text-[color:var(--app-text)]"
          onClick={() => execCommand('bold')}
          title="Жирный"
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[color:var(--app-text-muted)] hover:bg-[var(--dropdown-hover)] hover:text-[color:var(--app-text)]"
          onClick={() => execCommand('italic')}
          title="Курсив"
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[color:var(--app-text-muted)] hover:bg-[var(--dropdown-hover)] hover:text-[color:var(--app-text)]"
          onClick={() => execCommand('insertUnorderedList')}
          title="Маркированный список"
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[color:var(--app-text-muted)] hover:bg-[var(--dropdown-hover)] hover:text-[color:var(--app-text)]"
          onClick={() => execCommand('insertOrderedList')}
          title="Нумерованный список"
        >
          <ListOrdered className="size-4" />
        </Button>
      </div>
      <div
        ref={ref}
        contentEditable
        className="min-h-[120px] px-3 py-2 text-base text-[color:var(--app-text)] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[color:var(--app-text-subtle)]"
        data-placeholder={placeholder ?? 'Введите текст...'}
        onInput={handleInput}
        suppressContentEditableWarning
      />
    </div>
  )
}
