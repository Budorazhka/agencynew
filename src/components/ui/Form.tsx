import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const formVariants = cva('space-y-6', {
  variants: {
    spacing: {
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8',
    },
  },
  defaultVariants: {
    spacing: 'md',
  },
})

const fieldVariants = cva('space-y-2', {
  variants: {
    spacing: {
      sm: 'space-y-1',
      md: 'space-y-2',
      lg: 'space-y-3',
    },
  },
  defaultVariants: {
    spacing: 'md',
  },
})

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement>, VariantProps<typeof formVariants> {
  children: React.ReactNode
}

export interface FieldProps extends VariantProps<typeof fieldVariants> {
  children: React.ReactNode
  label?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
}

export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: string
}

export function Form({ className, spacing, children, ...props }: FormProps) {
  return (
    <form className={cn(formVariants({ spacing }), className)} {...props}>
      {children}
    </form>
  )
}

// Обёртка для одного поля с отступами
export function FormItem({ className, ...props }: FormItemProps) {
  return <div className={cn('space-y-2', className)} {...props} />
}

// Лейбл поля. Если required=true — добавляет красную звёздочку.
export function FormLabel({ className, required, children, ...props }: FormLabelProps) {
  return (
    <label className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

// Обёртка для самого контрола (input, select и т.д.)
export function FormControl({ className, ...props }: FormControlProps) {
  return <div className={cn('relative', className)} {...props} />
}

// Подсказка под полем — серый мелкий текст
export function FormDescription({ className, children, ...props }: FormDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  )
}

// Текст ошибки под полем. Принимает error или children. Не рендерится если текста нет.
export function FormMessage({ className, error, children, ...props }: FormMessageProps) {
  const message = error || children

  if (!message) {
    return null
  }

  return (
    <p className={cn('text-sm font-medium text-red-600', className)} {...props}>
      {message}
    </p>
  )
}

// Поле формы целиком: лейбл + контрол + описание + ошибка
export function Field({ children, label, description, error, required, spacing, className }: FieldProps) {
  return (
    <div className={cn(fieldVariants({ spacing }), className)}>
      {label && (
        <FormLabel required={required}>
          {label}
        </FormLabel>
      )}
      <FormControl>
        {children}
      </FormControl>
      {description && (
        <FormDescription>
          {description}
        </FormDescription>
      )}
      {error && (
        <FormMessage error={error} />
      )}
    </div>
  )
}

// Группа полей с рамкой и внутренними отступами
export function FieldGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-4 p-4 border rounded-lg', className)} {...props}>
      {children}
    </div>
  )
}

// Несколько полей в одну строку
export function InlineField({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center gap-4', className)} {...props}>
      {children}
    </div>
  )
}

// Нижняя часть формы с кнопками
export function FormActions({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center gap-3 pt-4', className)} {...props}>
      {children}
    </div>
  )
}

// Красная звёздочка для обязательного поля
export function RequiredIndicator() {
  return <span className="text-red-500 ml-1">*</span>
}

// Маленькая подсказка рядом с лейблом поля
export function FieldHint({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-xs text-muted-foreground ml-2', className)} {...props}>
      {children}
    </span>
  )
}
