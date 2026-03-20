import { useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const MAX_SIZE_MB = 5

interface ImageUploadProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onChange(reader.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const clear = () => onChange(undefined)

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-base">Изображение</Label>
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Превью"
            className="max-h-40 rounded-md border border-input object-contain"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-1 top-1 size-8 rounded-full"
            onClick={clear}
            title="Удалить"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="mr-2 size-4" />
            Прикрепить изображение
          </Button>
          <span className="text-sm text-muted-foreground">до {MAX_SIZE_MB} МБ</span>
        </div>
      )}
    </div>
  )
}
