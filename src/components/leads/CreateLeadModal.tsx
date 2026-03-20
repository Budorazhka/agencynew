import { X, Save } from 'lucide-react'
import { useFormValidation } from '@/hooks/useFormValidation'
import { leadSchema } from '@/lib/validation/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, Field, FormActions } from '@/components/ui/Form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface CreateLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: any) => void
}

export function CreateLeadModal({ open, onOpenChange, onSubmit }: CreateLeadModalProps) {
  const form = useFormValidation(leadSchema, {
    onSubmit: async (data) => {
      onSubmit?.(data)
      onOpenChange(false)
      form.reset()
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Создание лида</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Заполните информацию о новом потенциальном клиенте
          </DialogDescription>
        </DialogHeader>

        <Form onSubmit={form.handleSubmit}>
          <Field
            label="Имя клиента"
            description="ФИО контактного лица"
            error={form.getFieldError('name')}
            required
          >
            <Input
              {...form.register('name')}
              placeholder="Иван Иванов"
              disabled={form.formState.isSubmitting}
            />
          </Field>

          <Field
            label="Email"
            description="Для отправки коммерческих предложений"
            error={form.getFieldError('email')}
          >
            <Input
              {...form.register('email')}
              type="email"
              placeholder="ivan@example.com"
              disabled={form.formState.isSubmitting}
            />
          </Field>

          <Field
            label="Телефон"
            description="Для оперативной связи"
            error={form.getFieldError('phone')}
          >
            <Input
              {...form.register('phone')}
              placeholder="+7 (900) 123-45-67"
              disabled={form.formState.isSubmitting}
            />
          </Field>

          <Field
            label="Источник"
            description="Откуда пришел лид"
            error={form.getFieldError('source')}
            required
          >
            <Select {...form.register('source')} disabled={form.formState.isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите источник" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Первичный источник</SelectItem>
                <SelectItem value="secondary">Вторичный источник</SelectItem>
                <SelectItem value="rent">Аренда</SelectItem>
                <SelectItem value="ad_campaigns">Рекламная кампания</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Бюджет"
            description="Ожидаемый бюджет клиента"
            error={form.getFieldError('budget')}
          >
            <Input
              {...form.register('budget')}
              type="number"
              placeholder="1000000"
              disabled={form.formState.isSubmitting}
            />
          </Field>

          <Field
            label="Примечания"
            description="Дополнительная информация о клиенте"
            error={form.getFieldError('notes')}
          >
            <Textarea
              {...form.register('notes')}
              placeholder="Особые требования, предпочтения, дополнительная информация..."
              rows={3}
              disabled={form.formState.isSubmitting}
            />
          </Field>

          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Создать лид
                </>
              )}
            </Button>
          </FormActions>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
