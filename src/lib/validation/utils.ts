import { useState, useEffect } from 'react'
import { type FieldErrors } from 'react-hook-form'
import { z } from 'zod'

// Преобразует ошибки Zod в формат который ожидает react-hook-form
export function zodToFormErrors(zodError: z.ZodError): FieldErrors {
  const errors: FieldErrors = {}

  zodError.issues.forEach((issue) => {
    const path = issue.path.join('.')
    errors[path] = {
      type: issue.code,
      message: issue.message,
    }
  })

  return errors
}

// Валидирует одно поле по переданной схеме. Возвращает isValid и текст ошибки если есть.
export function validateField<T>(
  value: any,
  schema: z.ZodSchema<T>,
  fieldName: keyof T
): { isValid: boolean; error?: string } {
  try {
    schema.parse({ [fieldName]: value } as Partial<T>)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.issues.find(err => err.path[0] === fieldName)
      return {
        isValid: false,
        error: fieldError?.message
      }
    }
    return { isValid: false, error: 'Ошибка валидации' }
  }
}

// Создаёт асинхронный валидатор с debounce. Каждый вызов отменяет предыдущий таймер
// и запускает новый через delay мс. Полезно для валидации при вводе.
export function createAsyncValidator<T>(
  schema: z.ZodSchema<T>,
  delay: number = 300
) {
  let timeoutId: ReturnType<typeof setTimeout>

  return (value: any, fieldName: keyof T): Promise<{ isValid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const result = validateField(value, schema, fieldName)
        resolve(result)
      }, delay)
    })
  }
}

// Набор простых валидаторов для отдельных полей — возвращают строку ошибки или undefined
export const customValidators = {
  // Российский номер телефона: +7, 8 или без кода, затем 10 цифр в разных форматах
  phone: (value: string) => {
    const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
    return phoneRegex.test(value) ? undefined : 'Введите корректный номер телефона'
  },

  // ИНН: 10 цифр для юрлиц или 12 для физлиц
  inn: (value: string) => {
    const innRegex = /^\d{10}$|^\d{12}$/
    return innRegex.test(value) ? undefined : 'ИНН должен содержать 10 или 12 цифр'
  },

  // Надёжный пароль: минимум 8 символов, есть заглавная, строчная и цифра
  strongPassword: (value: string) => {
    if (value.length < 8) return 'Минимум 8 символов'
    if (!/[A-Z]/.test(value)) return 'Хотя бы одна заглавная буква'
    if (!/[a-z]/.test(value)) return 'Хотя бы одна строчная буква'
    if (!/\d/.test(value)) return 'Хотя бы одна цифра'
    return undefined
  },

  // URL с любым протоколом — проверяется через встроенный конструктор URL
  url: (value: string) => {
    try {
      new URL(value)
      return undefined
    } catch {
      return 'Введите корректный URL'
    }
  },

  // Имя/фамилия — только буквы (рус/лат), пробелы и дефисы
  name: (value: string) => {
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/
    return nameRegex.test(value) ? undefined : 'Имя может содержать только буквы, пробелы и дефисы'
  },

  // Бюджет — целое положительное число, пробелы между разрядами разрешены
  budget: (value: string) => {
    const cleanValue = value.replace(/\s/g, '')
    if (!/^\d+$/.test(cleanValue)) return 'Бюджет должен быть числом'
    const num = parseInt(cleanValue, 10)
    if (num <= 0) return 'Бюджет должен быть больше 0'
    if (num > 999999999) return 'Слишком большой бюджет'
    return undefined
  }
}

// Утилиты для форматирования значений перед показом пользователю
// и очистки перед отправкой на сервер
export const formatters = {
  // Форматирует телефон в вид +7 (XXX) XXX-XX-XX
  phone: (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return cleaned.replace(/(\+7|8)(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 ($2) $3-$4-$5')
    }
    return value
  },

  // Форматирует число с пробелами между разрядами (локаль ru-RU)
  budget: (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value.replace(/\s/g, ''), 10) : value
    return num.toLocaleString('ru-RU')
  },

  // Убирает всё кроме цифр — для отправки на сервер
  cleanPhone: (value: string) => {
    return value.replace(/\D/g, '')
  },

  // Убирает пробелы — для отправки на сервер
  cleanBudget: (value: string) => {
    return value.replace(/\s/g, '')
  }
}

// Хук debounce — возвращает значение с задержкой delay мс.
// Пока значение меняется быстрее чем delay, результат не обновляется.
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Создаёт функцию-валидатор для переданной схемы.
// Если передать customMessages — для указанных полей используются свои тексты ошибок.
export function createValidator<T>(
  schema: z.ZodSchema<T>,
  customMessages?: Partial<Record<keyof T, string>>
) {
  return (data: T): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
    try {
      schema.parse(data)
      return { isValid: true, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof T, string>> = {}

        error.issues.forEach((err) => {
          const field = err.path[0] as keyof T
          errors[field] = customMessages?.[field] || err.message
        })

        return { isValid: false, errors }
      }

      return { isValid: false, errors: {} }
    }
  }
}
