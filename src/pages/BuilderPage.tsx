import { useState, useMemo } from 'react'
import { useLocation } from 'wouter'
import { FOODS } from '../data/foods'
import { useMealBuilderContext } from '../hooks/useMealBuilderContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { findSwap } from '../utils/swap'
import { toDrivingKm } from '../utils/equivalents'
import type { Meal } from '../types'
import CO2Badge from '../components/CO2Badge'
import PlateViz from '../components/PlateViz'
import SwapCard from '../components/SwapCard'

const PORTION_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
const QUICK_LABELS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function BuilderPage() {
  const {
    items,
    label,
    totalCO2e,
    drivingKmEquivalent,
    removeItem,
    setPortions,
    clearMeal,
    setLabel,
  } = useMealBuilderContext()
  const [, navigate] = useLocation()
  const [, setSavedMeals] = useLocalStorage<Meal[]>('co2-tracker-meals', [])
  const [saveDate, setSaveDate] = useState(todayString)
  const [saved, setSaved] = useState(false)

  const foodMap = useMemo(() => new Map(FOODS.map((f) => [f.id, f])), [])

  const swapSuggestion = useMemo(
    () => findSwap(items, FOODS),
    [items],
  )

  function handleSave() {
    const meal: Meal = {
      id: crypto.randomUUID(),
      date: saveDate,
      label: label || null,
      items: [...items],
      total_co2e: totalCO2e,
      driving_km_equivalent: drivingKmEquivalent,
    }
    setSavedMeals((prev) => [...prev, meal])
    setSaved(true)
  }

  function handleClearAndBuild() {
    clearMeal()
    setSaved(false)
    setSaveDate(todayString())
  }

  if (items.length === 0 && !saved) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-text-primary">Meal Builder</h1>
        <div className="mt-8 text-center">
          <p className="text-text-secondary">
            Add items from the Explorer to build a meal.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 min-h-[44px] rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Browse Foods
          </button>
        </div>
      </div>
    )
  }

  if (saved) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-text-primary">Meal Builder</h1>
        <div className="mt-8 rounded-lg border border-co2-low/30 bg-co2-low/5 p-6 text-center">
          <p className="text-lg font-semibold text-text-primary">
            Daily Estimate saved
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Your meal has been added to {saveDate}.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleClearAndBuild}
              className="min-h-[44px] rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Clear &amp; build another
            </button>
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="min-h-[44px] rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Meal Builder</h1>
        <button
          type="button"
          onClick={clearMeal}
          className="min-h-[44px] rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
        >
          Clear Meal
        </button>
      </div>

      {/* Meal items list */}
      <ul className="mt-4 space-y-3" aria-label="Meal items">
        {items.map((item) => {
          const food = foodMap.get(item.food_item_id)
          if (!food) return null
          return (
            <li
              key={item.food_item_id}
              className="rounded-lg border border-border bg-surface p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary">{food.name}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {food.portion_description}
                  </p>
                </div>
                <CO2Badge co2eKg={item.co2e} size="sm" />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`portions-${item.food_item_id}`}
                    className="text-sm text-text-secondary"
                  >
                    Portions:
                  </label>
                  <select
                    id={`portions-${item.food_item_id}`}
                    value={item.portions}
                    onChange={(e) =>
                      setPortions(item.food_item_id, Number(e.target.value))
                    }
                    className="min-h-[44px] rounded-lg border border-border bg-surface px-2 py-1 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label={`Portions of ${food.name}, currently ${item.portions}`}
                  >
                    {PORTION_STEPS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.food_item_id)}
                  className="min-h-[44px] min-w-[44px] rounded-lg border border-border px-3 py-2 text-sm text-co2-high transition-colors hover:bg-co2-high/10"
                  aria-label={`Remove ${food.name} from meal`}
                >
                  Remove
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Summary */}
      <div className="mt-4 rounded-lg border border-border bg-surface-secondary p-4">
        <h2 className="text-sm font-semibold text-text-primary">
          Meal Summary
        </h2>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-text-primary">
            {totalCO2e < 1 ? totalCO2e.toFixed(2) : totalCO2e.toFixed(1)} kg CO2e
          </span>
          {drivingKmEquivalent >= 0.1 && (
            <span className="text-sm text-text-secondary">
              ~{toDrivingKm(totalCO2e).toFixed(1)} km driving
            </span>
          )}
        </div>
      </div>

      {/* Plate Balance */}
      <div className="mt-4">
        <PlateViz items={items} />
      </div>

      {/* Swap Suggestion */}
      <div className="mt-4">
        <SwapCard suggestion={swapSuggestion} />
      </div>

      {/* Save to Daily Estimate */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text-primary">
          Save to Daily Estimate
        </h2>

        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="save-date" className="text-sm text-text-secondary">
              Date
            </label>
            <input
              id="save-date"
              type="date"
              value={saveDate}
              onChange={(e) => setSaveDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="save-label" className="text-sm text-text-secondary">
              Label (optional)
            </label>
            <input
              id="save-label"
              type="text"
              value={label ?? ''}
              onChange={(e) => setLabel(e.target.value || null)}
              placeholder="e.g. Breakfast, Lunch..."
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {QUICK_LABELS.map((ql) => (
                <button
                  key={ql}
                  type="button"
                  onClick={() => setLabel(ql)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    label === ql
                      ? 'bg-primary text-white'
                      : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {ql}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="min-h-[44px] w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Save to Daily Estimate
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuilderPage
