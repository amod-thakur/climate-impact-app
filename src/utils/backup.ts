import type { Meal } from '../types'

interface BackupData {
  version: 1
  exported_at: string
  meals: Meal[]
}

/**
 * Export all saved meals from localStorage as a JSON string.
 */
export function exportData(): string {
  const raw = localStorage.getItem('meals')
  const meals: Meal[] = raw ? (JSON.parse(raw) as Meal[]) : []

  const backup: BackupData = {
    version: 1,
    exported_at: new Date().toISOString(),
    meals,
  }

  return JSON.stringify(backup, null, 2)
}

/**
 * Validate and import meal data from a JSON string into localStorage.
 * Returns true on success, false if the data is invalid.
 */
export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json) as unknown

    if (!isValidBackup(data)) return false

    localStorage.setItem('meals', JSON.stringify(data.meals))
    return true
  } catch {
    return false
  }
}

/**
 * Trigger a browser file download of the given JSON content.
 */
export function triggerDownload(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isValidBackup(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) return false

  const obj = data as Record<string, unknown>
  if (obj.version !== 1) return false
  if (typeof obj.exported_at !== 'string') return false
  if (!Array.isArray(obj.meals)) return false

  return obj.meals.every(isValidMeal)
}

function isValidMeal(meal: unknown): meal is Meal {
  if (typeof meal !== 'object' || meal === null) return false

  const m = meal as Record<string, unknown>
  if (typeof m.id !== 'string') return false
  if (typeof m.date !== 'string') return false
  if (m.label !== null && typeof m.label !== 'string') return false
  if (!Array.isArray(m.items)) return false
  if (typeof m.total_co2e !== 'number') return false
  if (typeof m.driving_km_equivalent !== 'number') return false

  return m.items.every((item: unknown) => {
    if (typeof item !== 'object' || item === null) return false
    const i = item as Record<string, unknown>
    return (
      typeof i.food_item_id === 'string' &&
      typeof i.portions === 'number' &&
      typeof i.co2e === 'number'
    )
  })
}
