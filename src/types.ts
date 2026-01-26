/**
 * TypeScript types for the CO2 Food Tracker data model.
 *
 * All types derived from REQUIREMENTS.md §9.
 */

// ---------------------------------------------------------------------------
// Union types
// ---------------------------------------------------------------------------

/** Canada's Food Guide category for a food item. */
export type FoodCategory =
  | 'vegetables_fruits'
  | 'whole_grains'
  | 'protein'
  | 'other'

/** Sub-category within the protein group. null for non-protein items. */
export type SubCategory = 'plant' | 'animal' | 'dairy'

/** Indicates whether the portion weight refers to raw, dry, or as-sold mass. */
export type WeightBasis = 'raw' | 'dry' | 'as_sold'

/** The dominant greenhouse gas emitted during production. */
export type GHGType = 'CO2' | 'CH4' | 'N2O'

// ---------------------------------------------------------------------------
// Core entities
// ---------------------------------------------------------------------------

/** A single food item with its emission data and sourcing metadata. */
export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  sub_category: SubCategory | null
  /** Human-readable portion description, e.g. "125 mL cooked". */
  portion_description: string
  /** Portion weight in grams (raw/as-purchased). */
  portion_weight_grams: number
  weight_basis: WeightBasis
  /** kg CO2e per kg of product. */
  co2e_per_kg: number
  /** Pre-calculated: co2e_per_kg × portion_weight_grams / 1000. */
  co2e_per_portion: number
  dominant_ghg: GHGType
  /** Explanatory note, e.g. "75% methane from enteric fermentation". */
  ghg_note: string
  /** Short citation, e.g. "CFC LCA 2023" or "Poore & Nemecek 2018". */
  data_source: string
  /** URL to the original paper or report. */
  data_source_url: string
}

/** A food item added to a meal with a portion count. */
export interface MealItem {
  food_item_id: string
  /** Number of portions (0.5–5 in 0.5 steps). */
  portions: number
  /** Computed: food_item.co2e_per_portion × portions. */
  co2e: number
}

/** A saved meal tied to a date. */
export interface Meal {
  id: string
  /** Date in YYYY-MM-DD format. */
  date: string
  /** Optional label such as "Breakfast", "Lunch", etc. */
  label: string | null
  items: MealItem[]
  /** Sum of all items' co2e. */
  total_co2e: number
  /** total_co2e / 0.25 — driving km equivalent. */
  driving_km_equivalent: number
}

/**
 * Aggregated view of all meals saved for a single day.
 *
 * This is a **derived type** — it is computed from saved Meal[] data and is
 * never stored directly in localStorage. Consumers should build it on-the-fly
 * from the persisted meals list.
 */
export interface DailyEstimate {
  /** Date in YYYY-MM-DD format. */
  date: string
  meals: Meal[]
  /** Sum of all meals' total_co2e. */
  total_co2e: number
  /** total_co2e / 0.25 — driving km equivalent. */
  driving_km_equivalent: number
  /** total_co2e / 3.98 × 100 — percentage of average Canadian daily food emissions. */
  vs_canadian_average: number
}
