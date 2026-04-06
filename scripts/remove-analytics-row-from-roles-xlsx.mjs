/**
 * Удаляет строку «Аналитика» (тип «Раздел») с листа «Разделы» в ALPHABASE_sale_roles_accesses.xlsx.
 * Запуск: node scripts/remove-analytics-row-from-roles-xlsx.mjs
 */
import XLSX from 'xlsx'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const xlsxPath = join(root, 'ALPHABASE_sale_roles_accesses.xlsx')
const sheetName = 'Разделы'

if (!existsSync(xlsxPath)) {
  console.error('Файл не найден:', xlsxPath)
  process.exit(1)
}

const wb = XLSX.readFile(xlsxPath)
const ws = wb.Sheets[sheetName]
if (!ws) {
  console.error('Нет листа:', sheetName)
  process.exit(1)
}

const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true })
let removed = false
const filtered = data.filter((row) => {
  const a = row[0]
  const b = row[1]
  if (a === 'Аналитика' && String(b).trim() === 'Раздел') {
    removed = true
    return false
  }
  return true
})

if (!removed) {
  console.error('Строка «Аналитика / Раздел» не найдена — возможно, уже удалена.')
  process.exit(0)
}

wb.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(filtered)
XLSX.writeFile(wb, xlsxPath)
console.log('Удалена строка «Аналитика» с листа «Разделы»:', xlsxPath)
