import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMealBuilder } from './useMealBuilder'

describe('useMealBuilder', () => {
  // -----------------------------------------------------------------------
  // ADD_ITEM
  // -----------------------------------------------------------------------

  it('adds an item with 1 portion', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('potatoes')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].food_item_id).toBe('potatoes')
    expect(result.current.items[0].portions).toBe(1)
    expect(result.current.items[0].co2e).toBeCloseTo(0.03, 3)
  })

  it('increments portions when adding an existing item', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('potatoes')
    })
    act(() => {
      result.current.addItem('potatoes')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].portions).toBe(2)
  })

  it('ignores unknown food item ids', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('nonexistent_food')
    })

    expect(result.current.items).toHaveLength(0)
  })

  // -----------------------------------------------------------------------
  // REMOVE_ITEM
  // -----------------------------------------------------------------------

  it('removes an item from the meal', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('potatoes')
      result.current.addItem('beef')
    })
    act(() => {
      result.current.removeItem('potatoes')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].food_item_id).toBe('beef')
  })

  // -----------------------------------------------------------------------
  // SET_PORTIONS
  // -----------------------------------------------------------------------

  it('sets portions for an item', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('beef')
    })
    act(() => {
      result.current.setPortions('beef', 2.5)
    })

    expect(result.current.items[0].portions).toBe(2.5)
    expect(result.current.items[0].co2e).toBeCloseTo(2.6 * 2.5, 3)
  })

  it('clamps portions to minimum 0.5', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('beef')
    })
    act(() => {
      result.current.setPortions('beef', 0)
    })

    expect(result.current.items[0].portions).toBe(0.5)
  })

  it('clamps portions to maximum 5', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('beef')
    })
    act(() => {
      result.current.setPortions('beef', 10)
    })

    expect(result.current.items[0].portions).toBe(5)
  })

  // -----------------------------------------------------------------------
  // CLEAR_MEAL
  // -----------------------------------------------------------------------

  it('resets everything including label', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('beef')
      result.current.addItem('potatoes')
      result.current.setLabel('Dinner')
    })
    act(() => {
      result.current.clearMeal()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.label).toBeNull()
    expect(result.current.totalCO2e).toBe(0)
  })

  // -----------------------------------------------------------------------
  // SET_LABEL
  // -----------------------------------------------------------------------

  it('sets meal label', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.setLabel('Breakfast')
    })

    expect(result.current.label).toBe('Breakfast')
  })

  it('sets label to null', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.setLabel('Lunch')
    })
    act(() => {
      result.current.setLabel(null)
    })

    expect(result.current.label).toBeNull()
  })

  // -----------------------------------------------------------------------
  // Derived: totalCO2e
  // -----------------------------------------------------------------------

  it('computes totalCO2e from all items', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('beef') // 2.6
      result.current.addItem('potatoes') // 0.03
    })

    expect(result.current.totalCO2e).toBeCloseTo(2.63, 2)
  })

  // -----------------------------------------------------------------------
  // Derived: drivingKmEquivalent
  // -----------------------------------------------------------------------

  it('computes drivingKmEquivalent as totalCO2e / 0.25', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('beef') // 2.6 kg CO2e
    })

    expect(result.current.drivingKmEquivalent).toBeCloseTo(10.4, 1)
  })

  // -----------------------------------------------------------------------
  // Derived: plateBalance
  // -----------------------------------------------------------------------

  it('computes plate balance percentages by weight', () => {
    const { result } = renderHook(() => useMealBuilder())

    // potatoes = 150g veg, beef = 100g protein
    act(() => {
      result.current.addItem('potatoes')
      result.current.addItem('beef')
    })

    const { plateBalance } = result.current
    // 150 / 250 = 60%, 0 / 250 = 0%, 100 / 250 = 40%
    expect(plateBalance.vegetablesFruits).toBeCloseTo(60, 0)
    expect(plateBalance.wholeGrains).toBe(0)
    expect(plateBalance.protein).toBeCloseTo(40, 0)
  })

  it('returns zero plate balance for empty meal', () => {
    const { result } = renderHook(() => useMealBuilder())

    expect(result.current.plateBalance.vegetablesFruits).toBe(0)
    expect(result.current.plateBalance.wholeGrains).toBe(0)
    expect(result.current.plateBalance.protein).toBe(0)
  })

  // -----------------------------------------------------------------------
  // Derived: swapSuggestion
  // -----------------------------------------------------------------------

  it('provides a swap suggestion when applicable', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('beef')
    })

    expect(result.current.swapSuggestion).not.toBeNull()
    expect(result.current.swapSuggestion!.current_item.id).toBe('beef')
  })

  it('provides no swap suggestion for low-emission meals', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('potatoes')
    })

    expect(result.current.swapSuggestion).toBeNull()
  })

  // -----------------------------------------------------------------------
  // Recalculation on state changes
  // -----------------------------------------------------------------------

  it('recalculates derived values on every state change', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('beef')
    })
    const co2eBefore = result.current.totalCO2e

    act(() => {
      result.current.setPortions('beef', 2)
    })

    expect(result.current.totalCO2e).toBeGreaterThan(co2eBefore)
    expect(result.current.drivingKmEquivalent).toBeCloseTo(
      result.current.totalCO2e / 0.25,
      5,
    )
  })
})
