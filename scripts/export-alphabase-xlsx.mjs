/**
 * Экспорт листов ALPHABASE_sale_roles_accesses.xlsx в CSV (UTF-8 с BOM, разделитель ;).
 * Запуск: npm run alphabase:export
 */
import XLSX from 'xlsx'
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'ALPHABASE_sale_roles_accesses.xlsx')
const outDir = join(root, 'reference', 'alphabase')

if (!existsSync(src)) {
  console.error('Нет файла:', src)
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })
const wb = XLSX.readFile(src)

for (let i = 0; i < wb.SheetNames.length; i++) {
  const name = wb.SheetNames[i]
  const ws = wb.Sheets[name]
  const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';', blankrows: false })
  const fileSafe = `${String(i + 1).padStart(2, '0')}_${name.replace(/[\\/:*?"<>|]/g, '_')}.csv`
  writeFileSync(join(outDir, fileSafe), `\uFEFF${csv}`, 'utf8')
  console.log('Wrote', fileSafe)
}
