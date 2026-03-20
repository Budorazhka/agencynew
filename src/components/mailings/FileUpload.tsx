import { useRef } from 'react'
import { FilePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const MAX_SIZE_MB = 10

export interface FileUploadValue {
  url: string
  fileName: string
}

interface FileUploadProps {
  value: FileUploadValue | undefined
  onChange: (value: FileUploadValue | undefined) => void
  className?: string
}

export function FileUpload({ value, onChange, className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onChange({ url: reader.result as string, fileName: file.name })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const clear = () => onChange(undefined)

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-base">Файл</Label>
      {value ? (
        <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-base" title={value.fileName}>
            {value.fileName}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={clear}
          >
            <X className="mr-1 size-4" />
            Удалить
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <FilePlus className="mr-2 size-4" />
            Прикрепить файл
          </Button>
          <span className="text-sm text-muted-foreground">до {MAX_SIZE_MB} МБ</span>
        </div>
      )}
    </div>
  )
}
