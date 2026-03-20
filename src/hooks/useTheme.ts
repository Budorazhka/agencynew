import { useTheme as useThemeContext } from '@/context/ThemeContext'

/**
 * Удобный хук для работы с темой приложения
 * Возвращает текущую тему и флаг использования felt стиля
 */
export function useTheme() {
  return useThemeContext()
}

/**
 * Возвращает только флаг isFeltStyle для обратной совместимости
 */
export function useFeltStyle() {
  const { isFeltStyle } = useTheme()
  return isFeltStyle
}
