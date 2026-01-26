import { toDrivingKm } from '../utils/equivalents'

interface CO2BadgeProps {
  co2eKg: number
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Color thresholds for CO2e per portion (kg):
 * - green (low): < 0.5
 * - amber (medium): 0.5–2.0
 * - red (high): > 2.0
 */
function getCO2Color(co2eKg: number): string {
  if (co2eKg < 0.5) return 'text-co2-low'
  if (co2eKg <= 2.0) return 'text-co2-medium'
  return 'text-co2-high'
}

function getBgColor(co2eKg: number): string {
  if (co2eKg < 0.5) return 'bg-co2-low/10'
  if (co2eKg <= 2.0) return 'bg-co2-medium/10'
  return 'bg-co2-high/10'
}

function formatCO2e(co2eKg: number): string {
  if (co2eKg < 0.1) return co2eKg.toFixed(3)
  if (co2eKg < 1) return co2eKg.toFixed(2)
  return co2eKg.toFixed(1)
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
} as const

function CO2Badge({ co2eKg, size = 'md' }: CO2BadgeProps) {
  const km = toDrivingKm(co2eKg)
  const colorClass = getCO2Color(co2eKg)
  const bgClass = getBgColor(co2eKg)
  const sizeClass = SIZE_CLASSES[size]

  return (
    <span
      className={`inline-flex flex-col items-center rounded-md font-medium ${bgClass} ${sizeClass}`}
      aria-label={`${formatCO2e(co2eKg)} kilograms CO2 equivalent, like driving ${km.toFixed(1)} kilometers`}
    >
      <span className={`font-semibold ${colorClass}`}>
        {formatCO2e(co2eKg)} kg CO2e
      </span>
      {km >= 0.1 && (
        <span className="text-text-secondary text-[0.75em]">
          ~{km.toFixed(1)} km driving
        </span>
      )}
    </span>
  )
}

export default CO2Badge
