/**
 * Emission equivalence helpers.
 *
 * Reference values:
 *  - Average Canadian car: 0.25 kg CO2/km (NRCan)
 *  - Average Canadian daily food emissions: 3.98 kg CO2e/person/day
 *    (Veeramani et al., 2017)
 */

const KG_CO2_PER_KM = 0.25
const CANADIAN_DAILY_CO2E = 3.98

/** Convert kg CO2e to driving-km equivalent. */
export function toDrivingKm(co2eKg: number): number {
  return co2eKg / KG_CO2_PER_KM
}

/** Convert kg CO2e to percentage of average Canadian daily food emissions. */
export function toCanadianDailyPercent(co2eKg: number): number {
  return (co2eKg / CANADIAN_DAILY_CO2E) * 100
}

/** Return a human-readable driving equivalent string. */
export function formatEquivalent(co2eKg: number): string {
  const km = toDrivingKm(co2eKg)
  if (km < 0.1) {
    return `like driving ${Math.round(km * 1000)} m`
  }
  if (km < 10) {
    return `like driving ${km.toFixed(1)} km`
  }
  return `like driving ${Math.round(km)} km`
}
