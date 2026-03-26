import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface ConfirmationDialogProps {
  open: boolean
  title?: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
  /** Доп. классы для контента (поверх темы CRM). */
  contentClassName?: string
}

export function ConfirmationDialog({
  open,
  title = 'Подтверждение изменений',
  description = 'Вы уверены? Это изменит права доступа партнера',
  onConfirm,
  onCancel,
  contentClassName,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(state) => !state && onCancel()}>
      <AlertDialogContent
        className={cn(
          'border-[var(--green-border)] bg-[var(--green-card)] text-[color:var(--app-text)]',
          contentClassName,
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[color:var(--app-text)]">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-[color:var(--app-text-muted)]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="border-[var(--green-border)] bg-transparent text-[color:var(--app-text)] hover:bg-[var(--dropdown-hover)]"
          >
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[var(--gold)] text-[#0d2818] hover:bg-[var(--gold-light)]"
          >
            Подтвердить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
