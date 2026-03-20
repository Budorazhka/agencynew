import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Хук для форм с Zod-валидацией.
// Принимает схему Zod и опциональные колбеки onSubmit/onError.
// Возвращает всё что есть в react-hook-form плюс getFieldError и setFieldError.
export function useFormValidation(
  schema: any,
  options?: {
    onSubmit?: (data: any) => void | Promise<void>
    onError?: (errors: any) => void
  }
) {
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const handleSubmit = form.handleSubmit(
    async (data) => {
      try {
        await options?.onSubmit?.(data)
      } catch (error) {
        console.error('Form submission error:', error)
        options?.onError?.(error)
      }
    },
    (errors) => {
      console.error('Form validation errors:', errors)
      options?.onError?.(errors)
    }
  )

  // Возвращает текст ошибки для поля по его имени
  const getFieldError = (fieldName: string) => {
    return form.formState.errors[fieldName]?.message as string
  }

  // Устанавливает ошибку вручную — для серверных ошибок и прочего
  const setFieldError = (fieldName: string, message: string) => {
    form.setError(fieldName, { message })
  }

  return {
    ...form,
    handleSubmit,
    getFieldError,
    setFieldError,
  }
}
