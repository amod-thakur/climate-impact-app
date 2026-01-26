import type { SwapSuggestion } from '../utils/swap'

interface SwapCardProps {
  suggestion: SwapSuggestion | null
}

function SwapCard({ suggestion }: SwapCardProps) {
  if (!suggestion) return null

  return (
    <div className="rounded-lg border border-co2-low/30 bg-co2-low/5 p-4">
      <h3 className="mb-2 text-sm font-semibold text-text-primary">
        Swap Suggestion
      </h3>
      <p className="text-sm text-text-secondary">
        Your highest-impact item is{' '}
        <span className="font-medium text-text-primary">
          {suggestion.currentItemName}
        </span>{' '}
        ({suggestion.currentCO2e.toFixed(2)} kg CO2e). Swapping to{' '}
        <span className="font-medium text-co2-low">
          {suggestion.suggestedItemName}
        </span>{' '}
        would save{' '}
        <span className="font-semibold text-text-primary">
          {suggestion.savingsKg.toFixed(2)} kg CO2e
        </span>{' '}
        — like driving {suggestion.savingsKm.toFixed(1)} km less.
      </p>
    </div>
  )
}

export default SwapCard
