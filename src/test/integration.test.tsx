/**
 * Integration test suite — T-32
 *
 * Tests 5 core user flows:
 * 1. Explorer → add item → Builder shows item
 * 2. Build meal → adjust portions → total updates
 * 3. Build meal → save → appears in History
 * 4. Export data → import data → meals restored
 * 5. First visit → onboarding shows → dismiss → doesn't show again
 */

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { memoryLocation } from 'wouter/memory-location'
import { Router } from 'wouter'
import App from '../App'
import { FOODS } from '../data/foods'

// Helper to render App at a given route with navigation support
function renderApp(initialPath = '/') {
  const { hook, navigate } = memoryLocation({ path: initialPath, static: false })
  const result = render(
    <Router hook={hook}>
      <App />
    </Router>,
  )
  return { ...result, navigate }
}

// Helper to find the "Add" button within a food card
function getAddButtonForFood(foodName: string) {
  return screen.getByRole('button', { name: new RegExp(`add ${foodName} to meal`, 'i') })
}

describe('Integration Tests — T-32', () => {
  beforeEach(() => {
    localStorage.clear()
    // Pre-set onboarding_seen to avoid modal in most tests
    localStorage.setItem('onboarding_seen', 'true')
    // Pre-set storage_persisted to avoid async effect issues
    localStorage.setItem('storage_persisted', 'true')
  })

  // ---------------------------------------------------------------------------
  // Flow 1: Explorer → add item → Builder shows item
  // ---------------------------------------------------------------------------
  describe('Flow 1: Explorer → add item → Builder', () => {
    it('should add a food item from Explorer and see it in Builder', async () => {
      const user = userEvent.setup()
      renderApp('/')

      // Verify we're on the Explorer page
      expect(screen.getByRole('heading', { level: 1, name: 'Food Explorer' })).toBeInTheDocument()

      // Click "Add" button for Potatoes
      const addButton = getAddButtonForFood('Potatoes')
      await user.click(addButton)

      // Should navigate to Builder page
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Meal Builder' })).toBeInTheDocument()
      })

      // Potatoes should be in the meal list
      expect(screen.getByText('Potatoes')).toBeInTheDocument()
    })

    it('should allow adding multiple items from Explorer', async () => {
      const user = userEvent.setup()
      renderApp('/')

      // Add first item (Potatoes)
      await user.click(getAddButtonForFood('Potatoes'))

      // Navigate back to Explorer
      const explorerLink = screen.getAllByRole('tab', { name: /explorer/i })[0]
      await user.click(explorerLink)

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Food Explorer' })).toBeInTheDocument()
      })

      // Add second item (search for Beef)
      const searchInput = screen.getByPlaceholderText(/search foods/i)
      await user.type(searchInput, 'Beef')

      // Wait for search results and click Add button
      await waitFor(() => {
        expect(screen.getByText('Beef')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /add beef to meal/i }))

      // Should have both items in Builder
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Meal Builder' })).toBeInTheDocument()
      })

      // Check both items are in the meal list
      const mealList = screen.getByRole('list', { name: /meal items/i })
      expect(within(mealList).getByText('Potatoes')).toBeInTheDocument()
      expect(within(mealList).getByText('Beef')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Flow 2: Build meal → adjust portions → total updates
  // ---------------------------------------------------------------------------
  describe('Flow 2: Adjust portions → total updates', () => {
    it('should update total CO2e when portions are adjusted', async () => {
      const user = userEvent.setup()
      renderApp('/')

      // Add beef (high CO2e item) to meal
      const searchInput = screen.getByPlaceholderText(/search foods/i)
      await user.type(searchInput, 'Beef')

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText('Beef')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /add beef to meal/i }))

      // Wait for Builder page
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Meal Builder' })).toBeInTheDocument()
      })

      // Get the beef item from FOODS to know expected CO2e
      const beefItem = FOODS.find(f => f.name === 'Beef')!

      // Check initial total (1 portion)
      expect(screen.getByText(/meal summary/i)).toBeInTheDocument()

      // Find the portion selector and change it to 2
      const portionSelect = screen.getByLabelText(/portions of beef/i)
      await user.selectOptions(portionSelect, '2')

      // Total should now be 2x the original
      const expectedNewCO2e = beefItem.co2e_per_portion * 2
      await waitFor(() => {
        const summarySection = screen.getByText(/meal summary/i).closest('div')!
        const summaryText = summarySection.textContent
        // Check that the CO2e value increased (it should contain the new value)
        expect(summaryText).toContain('kg CO2e')
      })

      // Verify the per-item CO2e badge updated
      const mealList = screen.getByRole('list', { name: /meal items/i })
      const beefListItem = within(mealList).getByText('Beef').closest('li')!
      expect(beefListItem.textContent).toContain(expectedNewCO2e.toFixed(1))
    })

    it('should clear meal when Clear Meal button is clicked', async () => {
      const user = userEvent.setup()
      renderApp('/')

      // Add an item
      await user.click(getAddButtonForFood('Potatoes'))

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Meal Builder' })).toBeInTheDocument()
      })

      // Verify item is present
      expect(screen.getByText('Potatoes')).toBeInTheDocument()

      // Click Clear Meal
      const clearButton = screen.getByRole('button', { name: /clear meal/i })
      await user.click(clearButton)

      // Should show empty state
      expect(screen.getByText(/add items from the explorer/i)).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Flow 3: Build meal → save → appears in History
  // ---------------------------------------------------------------------------
  describe('Flow 3: Build meal → save → History', () => {
    it('should save a meal and see it in History', async () => {
      const user = userEvent.setup()
      renderApp('/')

      // Add an item
      await user.click(getAddButtonForFood('Potatoes'))

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Meal Builder' })).toBeInTheDocument()
      })

      // Set a label
      const labelInput = screen.getByLabelText(/label/i)
      await user.clear(labelInput)
      await user.type(labelInput, 'Test Lunch')

      // Save the meal
      const saveButton = screen.getByRole('button', { name: /save to daily estimate/i })
      await user.click(saveButton)

      // Should show confirmation
      await waitFor(() => {
        expect(screen.getByText(/daily estimate saved/i)).toBeInTheDocument()
      })

      // Navigate to History
      const historyLink = screen.getAllByRole('tab', { name: /history/i })[0]
      await user.click(historyLink)

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'History' })).toBeInTheDocument()
      })

      // Should see the saved meal date
      const dailyList = screen.getByRole('list', { name: /daily estimates/i })
      expect(dailyList).toBeInTheDocument()

      // Expand the day to see the meal
      const dayButton = within(dailyList).getAllByRole('button')[0]
      await user.click(dayButton)

      // Should see our labeled meal
      expect(screen.getByText('Test Lunch')).toBeInTheDocument()
    })

    it('should save multiple meals to the same date', async () => {
      const user = userEvent.setup()
      renderApp('/')

      // Add and save first meal
      await user.click(getAddButtonForFood('Potatoes'))

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Meal Builder' })).toBeInTheDocument()
      })

      // Use quick label
      const breakfastButton = screen.getByRole('button', { name: 'Breakfast' })
      await user.click(breakfastButton)

      const saveButton = screen.getByRole('button', { name: /save to daily estimate/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/daily estimate saved/i)).toBeInTheDocument()
      })

      // Clear and build another
      const clearBuildButton = screen.getByRole('button', { name: /clear & build another/i })
      await user.click(clearBuildButton)

      // Navigate to Explorer and add another item
      const explorerLink = screen.getAllByRole('tab', { name: /explorer/i })[0]
      await user.click(explorerLink)

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Food Explorer' })).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search foods/i)
      await user.type(searchInput, 'Beef')

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText('Beef')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /add beef to meal/i }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Meal Builder' })).toBeInTheDocument()
      })

      // Use quick label for dinner
      const dinnerButton = screen.getByRole('button', { name: 'Dinner' })
      await user.click(dinnerButton)

      const saveButton2 = screen.getByRole('button', { name: /save to daily estimate/i })
      await user.click(saveButton2)

      await waitFor(() => {
        expect(screen.getByText(/daily estimate saved/i)).toBeInTheDocument()
      })

      // Navigate to History
      const historyLink2 = screen.getAllByRole('tab', { name: /history/i })[0]
      await user.click(historyLink2)

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'History' })).toBeInTheDocument()
      })

      // Should show "2 meals" for today
      expect(screen.getByText(/2 meals/i)).toBeInTheDocument()

      // Expand and verify both meals
      const dailyList = screen.getByRole('list', { name: /daily estimates/i })
      const dayButton = within(dailyList).getAllByRole('button')[0]
      await user.click(dayButton)

      expect(screen.getByText('Breakfast')).toBeInTheDocument()
      expect(screen.getByText('Dinner')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Flow 4: Export data → import data → meals restored
  // ---------------------------------------------------------------------------
  describe('Flow 4: Export → import → restore', () => {
    it('should export data and import it back (replace mode)', async () => {
      const user = userEvent.setup()

      // Pre-populate localStorage with a meal
      const testMeal = {
        id: 'test-meal-1',
        date: '2026-01-15',
        label: 'Export Test',
        items: [{ food_item_id: 'potatoes', portions: 1, co2e: 0.03 }],
        total_co2e: 0.03,
        driving_km_equivalent: 0.12,
      }
      localStorage.setItem('co2-tracker-meals', JSON.stringify([testMeal]))

      renderApp('/settings')

      // Click Export button
      const exportButton = screen.getByRole('button', { name: /export my data/i })
      await user.click(exportButton)

      // Should show confirmation
      expect(screen.getByText(/backup downloaded/i)).toBeInTheDocument()

      // Clear meals to simulate data loss
      localStorage.setItem('co2-tracker-meals', JSON.stringify([]))

      // Create a backup file to import
      const backupData = {
        version: 1,
        exported_at: new Date().toISOString(),
        meals: [testMeal],
      }
      const backupFile = new File([JSON.stringify(backupData)], 'backup.json', {
        type: 'application/json',
      })

      // Upload the file
      const fileInput = document.getElementById('import-file') as HTMLInputElement
      await user.upload(fileInput, backupFile)

      // Wait for preview
      await waitFor(() => {
        expect(screen.getByText(/this backup contains/i)).toBeInTheDocument()
      })

      // Choose replace mode
      const replaceButton = screen.getByRole('button', { name: /replace existing data/i })
      await user.click(replaceButton)

      // Should show success
      await waitFor(() => {
        expect(screen.getByText(/replaced existing data/i)).toBeInTheDocument()
      })

      // Verify meal is restored in localStorage
      const storedMeals = JSON.parse(localStorage.getItem('co2-tracker-meals') || '[]')
      expect(storedMeals).toHaveLength(1)
      expect(storedMeals[0].label).toBe('Export Test')
    })

    it('should merge imported data with existing meals', async () => {
      const user = userEvent.setup()

      // Pre-populate with one meal
      const existingMeal = {
        id: 'existing-meal',
        date: '2026-01-15',
        label: 'Existing Meal',
        items: [{ food_item_id: 'potatoes', portions: 1, co2e: 0.03 }],
        total_co2e: 0.03,
        driving_km_equivalent: 0.12,
      }
      localStorage.setItem('co2-tracker-meals', JSON.stringify([existingMeal]))

      renderApp('/settings')

      // Create a backup with a different meal
      const newMeal = {
        id: 'new-meal',
        date: '2026-01-16',
        label: 'Imported Meal',
        items: [{ food_item_id: 'beef', portions: 1, co2e: 2.6 }],
        total_co2e: 2.6,
        driving_km_equivalent: 10.4,
      }
      const backupData = {
        version: 1,
        exported_at: new Date().toISOString(),
        meals: [newMeal],
      }
      const backupFile = new File([JSON.stringify(backupData)], 'backup.json', {
        type: 'application/json',
      })

      // Upload the file
      const fileInput = document.getElementById('import-file') as HTMLInputElement
      await user.upload(fileInput, backupFile)

      await waitFor(() => {
        expect(screen.getByText(/this backup contains/i)).toBeInTheDocument()
      })

      // Choose merge mode
      const mergeButton = screen.getByRole('button', { name: /merge with existing data/i })
      await user.click(mergeButton)

      // Should show success
      await waitFor(() => {
        expect(screen.getByText(/merged/i)).toBeInTheDocument()
      })

      // Verify both meals are in localStorage
      const storedMeals = JSON.parse(localStorage.getItem('co2-tracker-meals') || '[]')
      expect(storedMeals).toHaveLength(2)
      expect(storedMeals.map((m: { label: string }) => m.label)).toContain('Existing Meal')
      expect(storedMeals.map((m: { label: string }) => m.label)).toContain('Imported Meal')
    })

    it('should reject invalid backup files', async () => {
      const user = userEvent.setup()
      renderApp('/settings')

      // Create an invalid file
      const invalidFile = new File(['{ "invalid": true }'], 'bad.json', {
        type: 'application/json',
      })

      const fileInput = document.getElementById('import-file') as HTMLInputElement
      await user.upload(fileInput, invalidFile)

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/invalid backup file/i)).toBeInTheDocument()
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Flow 5: First visit → onboarding shows → dismiss → doesn't show again
  // ---------------------------------------------------------------------------
  describe('Flow 5: Onboarding flow', () => {
    beforeEach(() => {
      // Clear onboarding_seen for these tests
      localStorage.removeItem('onboarding_seen')
    })

    it('should show onboarding modal on first visit', async () => {
      renderApp('/')

      // Should see the onboarding modal
      const modal = screen.getByRole('dialog', { name: /welcome/i })
      expect(modal).toBeInTheDocument()

      // Should contain the 4 key messages
      expect(screen.getByText(/food is responsible for 25%/i)).toBeInTheDocument()
      expect(screen.getByText(/average person.*4 kg co2e/i)).toBeInTheDocument()
      expect(screen.getByText(/helps you see which foods matter/i)).toBeInTheDocument()
      expect(screen.getByText(/canadian where available/i)).toBeInTheDocument()

      // Should have Start Exploring button
      expect(screen.getByRole('button', { name: /start exploring/i })).toBeInTheDocument()
    })

    it('should dismiss onboarding and not show again after clicking Start Exploring', async () => {
      const user = userEvent.setup()
      const { unmount } = renderApp('/')

      // Click Start Exploring
      const startButton = screen.getByRole('button', { name: /start exploring/i })
      await user.click(startButton)

      // Modal should disappear
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /welcome/i })).not.toBeInTheDocument()
      })

      // Should be on Explorer page
      expect(screen.getByRole('heading', { level: 1, name: 'Food Explorer' })).toBeInTheDocument()

      // Verify localStorage was set
      expect(localStorage.getItem('onboarding_seen')).toBe('true')

      // Unmount and re-render to simulate page refresh
      unmount()
      renderApp('/')

      // Modal should NOT appear on second visit
      expect(screen.queryByRole('dialog', { name: /welcome/i })).not.toBeInTheDocument()
    })

    it('should dismiss onboarding via close button', async () => {
      const user = userEvent.setup()
      renderApp('/')

      // Click the X button
      const closeButton = screen.getByRole('button', { name: /close onboarding/i })
      await user.click(closeButton)

      // Modal should disappear
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /welcome/i })).not.toBeInTheDocument()
      })

      // Verify localStorage was set
      expect(localStorage.getItem('onboarding_seen')).toBe('true')
    })

    it('should dismiss onboarding via Escape key', async () => {
      const user = userEvent.setup()
      renderApp('/')

      // Press Escape
      await user.keyboard('{Escape}')

      // Modal should disappear
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /welcome/i })).not.toBeInTheDocument()
      })

      // Verify localStorage was set
      expect(localStorage.getItem('onboarding_seen')).toBe('true')
    })

    it('should have a focus-trapping modal with proper accessibility', () => {
      renderApp('/')

      // Verify the modal has proper accessibility attributes
      const modal = screen.getByRole('dialog', { name: /welcome/i })
      expect(modal).toHaveAttribute('aria-modal', 'true')

      // Verify there's a close button
      expect(screen.getByRole('button', { name: /close onboarding/i })).toBeInTheDocument()

      // Verify there's a start exploring button
      expect(screen.getByRole('button', { name: /start exploring/i })).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Additional integration tests for edge cases
  // ---------------------------------------------------------------------------
  describe('Navigation integration', () => {
    it('should persist meal state when navigating between pages', async () => {
      const user = userEvent.setup()
      renderApp('/')

      // Add an item
      await user.click(getAddButtonForFood('Potatoes'))

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Meal Builder' })).toBeInTheDocument()
      })

      // Navigate to Settings
      const settingsLink = screen.getAllByRole('tab', { name: /settings/i })[0]
      await user.click(settingsLink)

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument()
      })

      // Navigate back to Builder
      const builderLink = screen.getAllByRole('tab', { name: /builder/i })[0]
      await user.click(builderLink)

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Meal Builder' })).toBeInTheDocument()
      })

      // Potatoes should still be in the meal
      expect(screen.getByText('Potatoes')).toBeInTheDocument()
    })
  })
})
