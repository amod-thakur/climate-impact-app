import type { MealItem } from '../types'
import { FOODS } from '../data/foods'
import type { FoodCategory } from '../types'

interface PlateVizProps {
  items: MealItem[]
}

interface CategorySegment {
  key: FoodCategory
  label: string
  actual: number
  ideal: number
  color: string
}

const IDEAL_PROPORTIONS: Record<string, number> = {
  vegetables_fruits: 50,
  whole_grains: 25,
  protein: 25,
}

const CATEGORY_COLORS: Record<string, string> = {
  vegetables_fruits: 'bg-green-500',
  whole_grains: 'bg-amber-500',
  protein: 'bg-red-400',
  other: 'bg-gray-400',
}

const CATEGORY_LABELS: Record<string, string> = {
  vegetables_fruits: 'Veg & Fruit',
  whole_grains: 'Whole Grains',
  protein: 'Protein',
  other: 'Other',
}

function computePlateBalance(items: MealItem[]): Record<FoodCategory, number> {
  const foodMap = new Map(FOODS.map((f) => [f.id, f]))
  let totalWeight = 0
  const weightByCategory: Record<FoodCategory, number> = {
    vegetables_fruits: 0,
    whole_grains: 0,
    protein: 0,
    other: 0,
  }

  for (const item of items) {
    const food = foodMap.get(item.food_item_id)
    if (!food) continue
    const weight = food.portion_weight_grams * item.portions
    totalWeight += weight
    weightByCategory[food.category] += weight
  }

  if (totalWeight === 0) {
    return { vegetables_fruits: 0, whole_grains: 0, protein: 0, other: 0 }
  }

  return {
    vegetables_fruits: (weightByCategory.vegetables_fruits / totalWeight) * 100,
    whole_grains: (weightByCategory.whole_grains / totalWeight) * 100,
    protein: (weightByCategory.protein / totalWeight) * 100,
    other: (weightByCategory.other / totalWeight) * 100,
  }
}

function PlateViz({ items }: PlateVizProps) {
  const balance = computePlateBalance(items)
  const isEmpty = items.length === 0

  const segments: CategorySegment[] = [
    {
      key: 'vegetables_fruits',
      label: CATEGORY_LABELS.vegetables_fruits,
      actual: balance.vegetables_fruits,
      ideal: IDEAL_PROPORTIONS.vegetables_fruits,
      color: CATEGORY_COLORS.vegetables_fruits,
    },
    {
      key: 'whole_grains',
      label: CATEGORY_LABELS.whole_grains,
      actual: balance.whole_grains,
      ideal: IDEAL_PROPORTIONS.whole_grains,
      color: CATEGORY_COLORS.whole_grains,
    },
    {
      key: 'protein',
      label: CATEGORY_LABELS.protein,
      actual: balance.protein,
      ideal: IDEAL_PROPORTIONS.protein,
      color: CATEGORY_COLORS.protein,
    },
  ]

  // Include "Other" only when it has content
  if (balance.other > 0) {
    segments.push({
      key: 'other',
      label: CATEGORY_LABELS.other,
      actual: balance.other,
      ideal: 0,
      color: CATEGORY_COLORS.other,
    })
  }

  const altText = isEmpty
    ? 'Empty plate. Add items to see proportions.'
    : `Plate balance: ${segments.map((s) => `${s.label} ${Math.round(s.actual)}%`).join(', ')}`

  return (
    <div
      className="rounded-lg border border-border bg-surface p-4"
      role="img"
      aria-label={altText}
    >
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        Plate Balance (by weight)
      </h3>

      {isEmpty ? (
        <p className="text-sm text-text-secondary">
          Add items to see how your meal compares to Canada's Food Guide plate.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Actual proportions bar */}
          <div>
            <p className="mb-1 text-xs font-medium text-text-secondary">
              Your meal
            </p>
            <div
              className="flex h-6 overflow-hidden rounded-full"
              aria-hidden="true"
            >
              {segments.map(
                (seg) =>
                  seg.actual > 0 && (
                    <div
                      key={seg.key}
                      className={`${seg.color} transition-all duration-300`}
                      style={{ width: `${seg.actual}%` }}
                      title={`${seg.label}: ${Math.round(seg.actual)}%`}
                    />
                  ),
              )}
            </div>
          </div>

          {/* CFG ideal proportions bar */}
          <div>
            <p className="mb-1 text-xs font-medium text-text-secondary">
              CFG ideal
            </p>
            <div
              className="flex h-6 overflow-hidden rounded-full opacity-50"
              aria-hidden="true"
            >
              <div
                className={CATEGORY_COLORS.vegetables_fruits}
                style={{ width: '50%' }}
                title="Veg & Fruit: 50%"
              />
              <div
                className={CATEGORY_COLORS.whole_grains}
                style={{ width: '25%' }}
                title="Whole Grains: 25%"
              />
              <div
                className={CATEGORY_COLORS.protein}
                style={{ width: '25%' }}
                title="Protein: 25%"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {segments.map((seg) => (
              <div key={seg.key} className="flex items-center gap-1.5 text-xs">
                <span
                  className={`inline-block h-3 w-3 rounded-sm ${seg.color}`}
                  aria-hidden="true"
                />
                <span className="text-text-secondary">
                  {seg.label}: {Math.round(seg.actual)}%
                  {seg.ideal > 0 && (
                    <span className="text-text-secondary/70">
                      {' '}
                      (ideal {seg.ideal}%)
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlateViz
