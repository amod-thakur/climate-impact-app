import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMealBuilder } from './useMealBuilder'

describe('useMealBuilder', () => {
  // -------------------------------------------------------------------------
  // ADD_ITEM
  // -------------------------------------------------------------------------
  describe('addItem', () => {
    it('adds a food item with 1 portion', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem('potatoes')
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].food_item_id).toBe('potatoes')
      expect(result.current.items[0].portions).toBe(1)
    })

    it('increments portions if item already exists', () => {
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

    it('caps portions at 5 when adding repeatedly', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem('potatoes')
        result.current.setPortions('potatoes', 5)
      })
      act(() => {
        result.current.addItem('potatoes')
      })

      expect(result.current.items[0].portions).toBe(5)
    })

    it('computes co2e correctly for the added item', () => {
      const { result } = renderHook(() => useMealBuilder())

      // Beef: co2e_per_portion = 2.6, 1 portion
      act(() => {
        result.current.addItem('beef')
      })

      expect(result.current.items[0].co2e).toBeCloseTo(2.6, 2)
    })
  })

  // -------------------------------------------------------------------------
  // REMOVE_ITEM
  // -------------------------------------------------------------------------
  describe('removeItem', () => {
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

    it('does nothing when removing a non-existent item', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem('potatoes')
      })
      act(() => {
        result.current.removeItem('nonexistent')
      })

      expect(result.current.items).toHaveLength(1)
    })
  })

  // -------------------------------------------------------------------------
  // SET_PORTIONS
  // -------------------------------------------------------------------------
  describe('setPortions', () => {
    it('sets the portion count for an item', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem('potatoes')
      })
      act(() => {
        result.current.setPortions('potatoes', 2.5)
      })

      expect(result.current.items[0].portions).toBe(2.5)
    })

    it('clamps portions to minimum of 0.5', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem('potatoes')
      })
      act(() => {
        result.current.setPortions('potatoes', 0)
      })

      expect(result.current.items[0].portions).toBe(0.5)
    })

    it('clamps portions to maximum of 5', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem('potatoes')
      })
      act(() => {
        result.current.setPortions('potatoes', 10)
      })

      expect(result.current.items[0].portions).toBe(5)
    })

    it('recalculates co2e when portions change', () => {
      const { result } = renderHook(() => useMealBuilder())

      // Beef: co2e_per_portion = 2.6
      act(() => {
        result.current.addItem('beef')
      })
      act(() => {
        result.current.setPortions('beef', 2)
      })

      expect(result.current.items[0].co2e).toBeCloseTo(5.2, 2)
    })
  })

  // -------------------------------------------------------------------------
  // CLEAR_MEAL
  // -------------------------------------------------------------------------
  describe('clearMeal', () => {
    it('removes all items and resets label', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem('potatoes')
        result.current.addItem('beef')
        result.current.setLabel('Dinner')
      })
      act(() => {
        result.current.clearMeal()
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.label).toBeNull()
    })
  })

  // -------------------------------------------------------------------------
  // SET_LABEL
  // -------------------------------------------------------------------------
  describe('setLabel', () => {
    it('sets the meal label', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.setLabel('Lunch')
      })

      expect(result.current.label).toBe('Lunch')
    })

    it('can set label to null', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.setLabel('Lunch')
      })
      act(() => {
        result.current.setLabel(null)
      })

      expect(result.current.label).toBeNull()
    })
  })

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  describe('derived values', () => {
    it('calculates totalCO2e as sum of all items', () => {
      const { result } = renderHook(() => useMealBuilder())

      // Potatoes: 0.03 per portion, Beef: 2.6 per portion
      act(() => {
        result.current.addItem('potatoes')
        result.current.addItem('beef')
      })

      expect(result.current.totalCO2e).toBeCloseTo(0.03 + 2.6, 2)
    })

    it('calculates drivingKmEquivalent as totalCO2e / 0.25', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem('beef') // 2.6 kg CO2e
      })

      expect(result.current.drivingKmEquivalent).toBeCloseTo(2.6 / 0.25, 1)
    })

    it('returns zero derived values for empty meal', () => {
      const { result } = renderHook(() => useMealBuilder())

      expect(result.current.totalCO2e).toBe(0)
      expect(result.current.drivingKmEquivalent).toBe(0)
      expect(result.current.plateBalance.vegetables_fruits).toBe(0)
      expect(result.current.plateBalance.whole_grains).toBe(0)
      expect(result.current.plateBalance.protein).toBe(0)
    })

    it('recalculates derived values on every state change', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem('beef') // 2.6
      })

      const co2eBefore = result.current.totalCO2e

      act(() => {
        result.current.addItem('potatoes') // +0.03
      })

      expect(result.current.totalCO2e).toBeGreaterThan(co2eBefore)
    })

    it('calculates plate balance by weight percentage', () => {
      const { result } = renderHook(() => useMealBuilder())

      // Potatoes: 150g veg, Beef: 100g protein (1 portion each)
      act(() => {
        result.current.addItem('potatoes')
        result.current.addItem('beef')
      })

      const totalWeight = 150 + 100
      expect(result.current.plateBalance.vegetables_fruits).toBeCloseTo(
        (150 / totalWeight) * 100,
        1,
      )
      expect(result.current.plateBalance.protein).toBeCloseTo(
        (100 / totalWeight) * 100,
        1,
      )
    })
  })
})
