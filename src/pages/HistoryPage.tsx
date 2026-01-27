import { useState, useMemo, lazy, Suspense } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { toDrivingKm, toCanadianDailyPercent } from '../utils/equivalents'
import { FOODS } from '../data/foods'
import type { Meal, DailyEstimate } from '../types'
import CO2Badge from '../components/CO2Badge'

const HistoryChart = lazy(() => import('../components/HistoryChart'))

function buildDailyEstimates(meals: Meal[]): DailyEstimate[] {
  const byDate = new Map<string, Meal[]>()
  for (const meal of meals) {
    const existing = byDate.get(meal.date) ?? []
    existing.push(meal)
    byDate.set(meal.date, existing)
  }

  const estimates: DailyEstimate[] = []
  for (const [date, dayMeals] of byDate) {
    const total_co2e = dayMeals.reduce((sum, m) => sum + m.total_co2e, 0)
    estimates.push({
      date,
      meals: dayMeals,
      total_co2e,
      driving_km_equivalent: toDrivingKm(total_co2e),
      vs_canadian_average: toCanadianDailyPercent(total_co2e),
    })
  }

  // Newest first
  estimates.sort((a, b) => b.date.localeCompare(a.date))
  return estimates
}

function HistoryPage() {
  const [meals] = useLocalStorage<Meal[]>('co2-tracker-meals', [])
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [chartRange, setChartRange] = useState<7 | 30>(7)

  const estimates = useMemo(() => buildDailyEstimates(meals), [meals])

  const foodMap = useMemo(() => new Map(FOODS.map((f) => [f.id, f])), [])

  if (estimates.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-text-primary">History</h1>
        <div className="mt-8 text-center">
          <p className="text-text-secondary">
            No saved estimates yet. Build a meal to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-text-primary">History</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Your saved daily estimates.
      </p>

      {/* Chart */}
      <div className="mt-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm text-text-secondary">Show:</span>
          <button
            type="button"
            onClick={() => setChartRange(7)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              chartRange === 7
                ? 'bg-primary text-white'
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            7 days
          </button>
          <button
            type="button"
            onClick={() => setChartRange(30)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              chartRange === 30
                ? 'bg-primary text-white'
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            30 days
          </button>
        </div>
        <Suspense
          fallback={
            <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-surface">
              <p className="text-sm text-text-secondary">Loading chart...</p>
            </div>
          }
        >
          <HistoryChart estimates={estimates} days={chartRange} />
        </Suspense>
      </div>

      {/* Day list */}
      <ul className="mt-6 space-y-3" aria-label="Daily estimates">
        {estimates.map((est) => (
          <li
            key={est.date}
            className="rounded-lg border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedDate(expandedDate === est.date ? null : est.date)
              }
              aria-expanded={expandedDate === est.date}
              className="flex min-h-[44px] w-full items-center justify-between p-4 text-left"
            >
              <div>
                <p className="font-semibold text-text-primary">{est.date}</p>
                <p className="text-sm text-text-secondary">
                  {est.meals.length} meal{est.meals.length !== 1 ? 's' : ''} —{' '}
                  {Math.round(est.vs_canadian_average)}% of Canadian avg
                </p>
              </div>
              <CO2Badge co2eKg={est.total_co2e} size="sm" />
            </button>

            {expandedDate === est.date && (
              <div className="border-t border-border px-4 pb-4 pt-2">
                {est.meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="mt-2 rounded-lg bg-surface-secondary p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text-primary">
                        {meal.label ?? 'Meal'}
                      </p>
                      <span className="text-sm text-text-secondary">
                        {meal.total_co2e < 1
                          ? meal.total_co2e.toFixed(2)
                          : meal.total_co2e.toFixed(1)}{' '}
                        kg CO2e
                      </span>
                    </div>
                    <ul className="mt-1.5 space-y-0.5">
                      {meal.items.map((item) => {
                        const food = foodMap.get(item.food_item_id)
                        return (
                          <li
                            key={item.food_item_id}
                            className="flex justify-between text-xs text-text-secondary"
                          >
                            <span>
                              {food?.name ?? item.food_item_id} x{item.portions}
                            </span>
                            <span>{item.co2e.toFixed(3)} kg</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HistoryPage
