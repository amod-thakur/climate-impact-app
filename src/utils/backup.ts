/**
 * JSON export/import for data durability.
 *
 * Exports all localStorage keys as a single JSON blob.
 * Imports validate the schema before writing.
 */

import type { Meal } from '../types'

export interface BackupData {
  version: 1
  exported_at: string
  meals: Meal[]
}

export interface BackupPreview {
  mealCount: number
  dateCount: number
  dates: string[]
  exportedAt: string
}

const MEALS_STORAGE_KEY = 'co2-tracker-meals'

/** Export all saved meals from localStorage as a JSON string. */
export function exportData(): string {
  const raw = localStorage.getItem(MEALS_STORAGE_KEY)
  const meals: Meal[] = raw ? (JSON.parse(raw) as Meal[]) : []

  const backup: BackupData = {
    version: 1,
    exported_at: new Date().toISOString(),
    meals,
  }

  return JSON.stringify(backup, null, 2)
}

/**
 * Parse and validate a JSON backup string without importing.
 * Returns a preview summary or null if invalid.
 */
export function parseBackup(json: string): BackupPreview | null {
  try {
    const data = JSON.parse(json) as unknown
    if (!isValidBackup(data)) return null

    const dates = [...new Set(data.meals.map((m) => m.date))].sort()
    return {
      mealCount: data.meals.length,
      dateCount: dates.length,
      dates,
      exportedAt: data.exported_at,
    }
  } catch {
    return null
  }
}

/** Validate and import a JSON backup string into localStorage (replace mode). Returns true on success. */
export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json) as unknown

    if (!isValidBackup(data)) return false

    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(data.meals))
    return true
  } catch {
    return false
  }
}

/**
 * Import a JSON backup and merge with existing meals (no duplicates by id).
 * Returns true on success.
 */
export function mergeData(json: string): boolean {
  try {
    const data = JSON.parse(json) as unknown
    if (!isValidBackup(data)) return false

    const raw = localStorage.getItem(MEALS_STORAGE_KEY)
    const existing: Meal[] = raw ? (JSON.parse(raw) as Meal[]) : []

    const existingIds = new Set(existing.map((m) => m.id))
    const newMeals = data.meals.filter((m) => !existingIds.has(m.id))
    const merged = [...existing, ...newMeals]

    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(merged))
    return true
  } catch {
    return false
  }
}

/** Trigger a file download in the browser. */
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
  if (typeof m.total_co2e !== 'number') return false
  if (typeof m.driving_km_equivalent !== 'number') return false
  if (!Array.isArray(m.items)) return false

  return true
}
