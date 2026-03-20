import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, MoreHorizontal, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type SortDirection = 'asc' | 'desc'

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, item: T, index: number) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  // Ключ поля для уникальной идентификации строк (аналог key в списке)
  rowKey: keyof T
  searchable?: boolean
  paginated?: boolean
  pageSize?: number
  className?: string
  variant?: 'default' | 'compact' | 'bordered'
  // Содержимое которое показывается когда данных нет
  emptyState?: React.ReactNode
  // Функция которая рендерит dropdown с действиями для каждой строки
  rowActions?: (item: T, index: number) => React.ReactNode
}

// Таблица данных с поиском по всем колонкам, сортировкой по клику на заголовок
// и постраничной навигацией. Все три операции выполняются на клиенте через useMemo.
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  searchable = true,
  paginated = false,
  pageSize = 10,
  className,
  variant = 'default',
  emptyState,
  rowActions
}: DataTableProps<T>) {
  const { isFeltStyle } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  // Фильтрация: ищем строку запроса в значении любой колонки
  const filteredData = useMemo(() => {
    if (!searchQuery) return data

    return data.filter(item =>
      columns.some(column => {
        const value = item[column.key]
        return String(value).toLowerCase().includes(searchQuery.toLowerCase())
      })
    )
  }, [data, searchQuery, columns])

  // Сортировка по выбранной колонке
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection])

  // Срез данных для текущей страницы
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData

    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, paginated])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const tableClasses = cn(
    'w-full rounded-lg overflow-hidden',
    {
      'border': variant === 'bordered',
      'border-2': variant === 'bordered',
    },
    isFeltStyle
      ? 'bg-[var(--felt-surface)] border-[var(--felt-border)]'
      : 'bg-background border-border',
    className
  )

  const headerClasses = cn(
    'border-b transition-colors',
    isFeltStyle
      ? 'border-[var(--felt-border)] bg-[var(--felt-bg-secondary)]'
      : 'border-border bg-muted/30'
  )

  const rowClasses = cn(
    'border-b transition-colors hover:transition-colors',
    isFeltStyle
      ? 'border-[var(--felt-border)] hover:bg-[var(--felt-hover-bg)]'
      : 'border-border hover:bg-muted/50'
  )

  const cellClasses = cn(
    'px-4 py-3 text-sm',
    isFeltStyle
      ? 'text-[var(--felt-text-primary)]'
      : 'text-foreground'
  )

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      <div className={tableClasses}>
        <table className="w-full">
          <thead>
            <tr className={headerClasses}>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-left font-medium',
                    isFeltStyle
                      ? 'text-[var(--felt-text-secondary)]'
                      : 'text-muted-foreground',
                    column.sortable && 'cursor-pointer hover:opacity-80',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
              {rowActions && (
                <th className="w-10 px-4 py-3 text-right">
                  <span className="sr-only">Действия</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={String(item[rowKey])} className={rowClasses}>
                {columns.map((column) => (
                  <td key={String(column.key)} className={cn(cellClasses, column.className)}>
                    {column.render
                      ? column.render(item[column.key], item, index)
                      : String(item[column.key] || '')
                    }
                  </td>
                ))}
                {rowActions && (
                  <td className="w-10 px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {rowActions(item, index)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className="text-center py-8">
            {emptyState || (
              <div className={cn('text-sm', isFeltStyle ? 'text-[var(--felt-text-muted)]' : 'text-muted-foreground')}>
                {searchQuery ? 'Ничего не найдено' : 'Нет данных'}
              </div>
            )}
          </div>
        )}
      </div>

      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className={cn('text-sm', isFeltStyle ? 'text-[var(--felt-text-muted)]' : 'text-muted-foreground')}>
            Показано {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedData.length)} из {sortedData.length}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Вперед
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Компактная версия без поиска и пагинации — для встраивания в виджеты
export function CompactDataTable<T extends Record<string, any>>(props: DataTableProps<T>) {
  return (
    <DataTable
      {...props}
      variant="compact"
      pageSize={5}
      searchable={false}
      paginated={false}
    />
  )
}
