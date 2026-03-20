import { z } from 'zod'

// Форма входа по логину и паролю
export const loginSchema = z.object({
  login: z
    .string()
    .min(1, 'Логин обязателен')
    .min(3, 'Минимум 3 символа')
    .max(50, 'Максимум 50 символов'),
  password: z
    .string()
    .min(1, 'Пароль обязателен')
    .min(1, 'Минимум 1 символ')
    .max(100, 'Максимум 100 символов'),
})

// Форма регистрации нового агентства
export const agencyRegistrationSchema = z.object({
  companyName: z
    .string()
    .min(1, 'Название компании обязательно')
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов'),
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  phone: z
    .string()
    .min(1, 'Телефон обязателен')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Введите корректный номер телефона'),
  website: z
    .string()
    .url('Введите корректный URL')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Максимум 500 символов')
    .optional(),
})

// Форма создания и редактирования лида
export const leadSchema = z.object({
  name: z
    .string()
    .min(1, 'Имя клиента обязательно')
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов'),
  email: z
    .string()
    .email('Введите корректный email')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Введите корректный номер телефона')
    .optional()
    .or(z.literal('')),
  source: z.enum(['primary', 'secondary', 'rent', 'ad_campaigns']),
  budget: z
    .string()
    .regex(/^\d+$/, 'Бюджет должен быть числом')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Бюджет должен быть больше 0')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Максимум 1000 символов')
    .optional(),
})

// Форма создания и редактирования менеджера
export const managerSchema = z.object({
  name: z
    .string()
    .min(1, 'Имя менеджера обязательно')
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов'),
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  login: z
    .string()
    .min(1, 'Логин обязателен')
    .min(3, 'Минимум 3 символа')
    .max(50, 'Максимум 50 символов')
    .regex(/^[a-zA-Z0-9._@-]+$/, 'Только латинские буквы, цифры и символы ._@-'),
  role: z.enum(['manager', 'rop', 'director']),
  sourceTypes: z
    .array(z.enum(['primary', 'secondary', 'rent', 'ad_campaigns']))
    .min(1, 'Выберите хотя бы один тип источника'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Введите корректный номер телефона')
    .optional()
    .or(z.literal('')),
})

// Форма настроек профиля пользователя, включая смену пароля
export const userSettingsSchema = z.object({
  name: z
    .string()
    .min(1, 'Имя обязательно')
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов'),
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Введите корректный номер телефона')
    .optional()
    .or(z.literal('')),
  currentPassword: z
    .string()
    .min(1, 'Текущий пароль обязателен')
    .optional(),
  newPassword: z
    .string()
    .min(6, 'Минимум 6 символов')
    .max(100, 'Максимум 100 символов')
    .optional()
    .or(z.literal('')),
  confirmPassword: z
    .string()
    .optional()
    .or(z.literal('')),
})
.refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  if (data.newPassword && data.currentPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: 'Пароли не совпадают или отсутствует текущий пароль',
  path: ['confirmPassword']
})

// Форма создания и редактирования рекламной кампании
export const campaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Название кампании обязательно')
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов'),
  channel: z.enum([
    'Яндекс.Директ',
    'ВКонтакте',
    'myTarget',
    'Google',
    'Meta (Instagram/Facebook)',
    'TikTok',
    'Telegram Ads',
    'Другое'
  ]),
  budget: z
    .string()
    .regex(/^\d+$/, 'Бюджет должен быть числом')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Бюджет должен быть больше 0'),
  startDate: z
    .string()
    .min(1, 'Дата начала обязательна'),
  endDate: z
    .string()
    .optional()
    .or(z.literal('')),
  utmSource: z
    .string()
    .max(50, 'Максимум 50 символов')
    .optional(),
  utmMedium: z
    .string()
    .max(50, 'Максимум 50 символов')
    .optional(),
  utmCampaign: z
    .string()
    .max(50, 'Максимум 50 символов')
    .optional(),
})
.refine((data) => {
  if (data.endDate && data.startDate && data.endDate < data.startDate) {
    return false
  }
  return true
}, {
  message: 'Дата окончания не может быть раньше даты начала',
  path: ['endDate']
})

// TypeScript типы данных форм, выведенные из схем
export type LoginFormData = z.infer<typeof loginSchema>
export type AgencyRegistrationFormData = z.infer<typeof agencyRegistrationSchema>
export type LeadFormData = z.infer<typeof leadSchema>
export type ManagerFormData = z.infer<typeof managerSchema>
export type UserSettingsFormData = z.infer<typeof userSettingsSchema>
export type CampaignFormData = z.infer<typeof campaignSchema>
