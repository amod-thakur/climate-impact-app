/**
 * CO2e equivalence conversions.
 *
 * - 0.25 kg CO2e ≈ driving 1 km in an average Canadian car (NRCan)
 * - 3.98 kg CO2e ≈ average Canadian's daily food emissions (Veeramani et al. 2017)
 */

const KG_CO2E_PER_KM = 0.25
const CANADIAN_DAILY_FOOD_CO2E = 3.98

/** Convert kg CO2e to equivalent driving distance in km. */
export function toDrivingKm(co2eKg: number): number {
  return co2eKg / KG_CO2E_PER_KM
}

/** Convert kg CO2e to percentage of average Canadian daily food emissions. */
export function toCanadianDailyPercent(co2eKg: number): number {
  return (co2eKg / CANADIAN_DAILY_FOOD_CO2E) * 100
}

/** Format a CO2e value as a human-readable driving equivalent string. */
export function formatEquivalent(co2eKg: number): string {
  const km = toDrivingKm(co2eKg)
  if (km < 0.1) {
    return `${co2eKg.toFixed(3)} kg CO2e`
  }
  return `${co2eKg.toFixed(2)} kg CO2e — like driving ${km.toFixed(1)} km`
}
