import { useState } from 'react'
import type { FoodItem } from '../types'
import CO2Badge from './CO2Badge'

interface FoodCardProps {
  food: FoodItem
  onAddToMeal: (id: string) => void
}

const GHG_LABELS: Record<string, string> = {
  CO2: 'Carbon dioxide',
  CH4: 'Methane',
  N2O: 'Nitrous oxide',
}

function FoodCard({ food, onAddToMeal }: FoodCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article
      className="rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
      aria-label={`${food.name}, ${food.co2e_per_portion.toFixed(3)} kilograms CO2 equivalent per portion`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-text-primary">
            {food.name}
          </h3>
          <p className="mt-0.5 text-sm text-text-secondary">
            {food.portion_description} ({food.portion_weight_grams}g)
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block rounded bg-surface-secondary px-1.5 py-0.5 text-xs text-text-secondary">
              {food.dominant_ghg}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <CO2Badge co2eKg={food.co2e_per_portion} size="sm" />
          <button
            type="button"
            onClick={() => onAddToMeal(food.id)}
            className="min-h-[44px] min-w-[44px] rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            aria-label={`Add ${food.name} to meal`}
          >
            + Add
          </button>
        </div>
      </div>

      {/* Expandable detail section */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-sm text-primary hover:underline"
        aria-expanded={expanded}
        aria-controls={`food-detail-${food.id}`}
      >
        {expanded ? 'Hide details' : 'Show details'}
      </button>

      {expanded && (
        <div
          id={`food-detail-${food.id}`}
          className="mt-2 space-y-1 border-t border-border pt-2 text-sm text-text-secondary"
        >
          <p>
            <span className="font-medium">Emission factor:</span>{' '}
            {food.co2e_per_kg} kg CO2e/kg
          </p>
          <p>
            <span className="font-medium">Dominant GHG:</span>{' '}
            {GHG_LABELS[food.dominant_ghg] ?? food.dominant_ghg}
          </p>
          {food.ghg_note && (
            <p>
              <span className="font-medium">Note:</span> {food.ghg_note}
            </p>
          )}
          <p>
            <span className="font-medium">Source:</span> {food.data_source}
            {food.data_source_url && (
              <>
                {' — '}
                <a
                  href={food.data_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary-dark"
                >
                  View source
                </a>
              </>
            )}
          </p>
        </div>
      )}
    </article>
  )
}

export default FoodCard
