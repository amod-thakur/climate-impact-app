import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FoodCard from './FoodCard'
import type { FoodItem } from '../types'

const MOCK_FOOD: FoodItem = {
  id: 'broccoli',
  name: 'Broccoli',
  category: 'vegetables_fruits',
  sub_category: null,
  portion_description: '125 mL chopped',
  portion_weight_grams: 80,
  weight_basis: 'raw',
  co2e_per_kg: 0.6,
  co2e_per_portion: 0.048,
  dominant_ghg: 'N2O',
  ghg_note: 'Nitrous oxide from fertilizer use',
  data_source: 'Poore & Nemecek 2018',
  data_source_url: 'https://doi.org/10.1126/science.aaq0216',
}

describe('FoodCard', () => {
  it('should show food name and portion description', () => {
    render(<FoodCard food={MOCK_FOOD} onAddToMeal={() => {}} />)

    expect(screen.getByText('Broccoli')).toBeInTheDocument()
    expect(screen.getByText('125 mL chopped (80g)')).toBeInTheDocument()
  })

  it('should show CO2Badge with emission data', () => {
    render(<FoodCard food={MOCK_FOOD} onAddToMeal={() => {}} />)

    expect(screen.getByText('0.048 kg CO2e')).toBeInTheDocument()
  })

  it('should show dominant GHG label', () => {
    render(<FoodCard food={MOCK_FOOD} onAddToMeal={() => {}} />)

    expect(screen.getByText('N2O')).toBeInTheDocument()
  })

  it('should call onAddToMeal with food id when Add button is clicked', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()

    render(<FoodCard food={MOCK_FOOD} onAddToMeal={onAdd} />)

    await user.click(screen.getByRole('button', { name: /Add Broccoli to meal/i }))
    expect(onAdd).toHaveBeenCalledWith('broccoli')
  })

  it('should show details when expand button is clicked', async () => {
    const user = userEvent.setup()

    render(<FoodCard food={MOCK_FOOD} onAddToMeal={() => {}} />)

    // Detail section should not be visible initially
    expect(screen.queryByText('View source')).not.toBeInTheDocument()

    // Click "Show details"
    await user.click(screen.getByText('Show details'))

    // Now details should be visible
    expect(screen.getByText(/Emission factor/)).toBeInTheDocument()
    expect(screen.getByText(/Dominant GHG/)).toBeInTheDocument()
    expect(screen.getByText('View source')).toHaveAttribute(
      'href',
      'https://doi.org/10.1126/science.aaq0216',
    )
  })

  it('should hide details when collapse button is clicked', async () => {
    const user = userEvent.setup()

    render(<FoodCard food={MOCK_FOOD} onAddToMeal={() => {}} />)

    await user.click(screen.getByText('Show details'))
    expect(screen.getByText('View source')).toBeInTheDocument()

    await user.click(screen.getByText('Hide details'))
    expect(screen.queryByText('View source')).not.toBeInTheDocument()
  })

  it('should have accessible aria-expanded on toggle button', async () => {
    const user = userEvent.setup()

    render(<FoodCard food={MOCK_FOOD} onAddToMeal={() => {}} />)

    const toggle = screen.getByText('Show details')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(screen.getByText('Hide details')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('should have external link with noopener noreferrer', async () => {
    const user = userEvent.setup()
    render(<FoodCard food={MOCK_FOOD} onAddToMeal={() => {}} />)

    await user.click(screen.getByText('Show details'))

    const link = screen.getByText('View source')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should have accessible article with food name in label', () => {
    render(<FoodCard food={MOCK_FOOD} onAddToMeal={() => {}} />)

    const article = screen.getByRole('article')
    expect(article).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Broccoli'),
    )
  })
})
