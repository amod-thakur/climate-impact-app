import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PlateViz from './PlateViz'
import type { MealItem } from '../types'

describe('PlateViz', () => {
  it('should handle empty meal state gracefully', () => {
    render(<PlateViz items={[]} />)

    expect(
      screen.getByText(
        /Add items to see how your meal compares/,
      ),
    ).toBeInTheDocument()
  })

  it('should render plate balance heading', () => {
    render(<PlateViz items={[]} />)

    expect(
      screen.getByText('Plate Balance (by weight)'),
    ).toBeInTheDocument()
  })

  it('should show proportion bars when items exist', () => {
    const items: MealItem[] = [
      { food_item_id: 'potatoes', portions: 1, co2e: 0.03 },
      { food_item_id: 'chicken', portions: 1, co2e: 0.22 },
    ]

    render(<PlateViz items={items} />)

    // Should show the "Your meal" label
    expect(screen.getByText('Your meal')).toBeInTheDocument()
    // Should show the "CFG ideal" reference
    expect(screen.getByText('CFG ideal')).toBeInTheDocument()
  })

  it('should display category percentages in the legend', () => {
    const items: MealItem[] = [
      { food_item_id: 'potatoes', portions: 1, co2e: 0.03 },  // 150g veg
      { food_item_id: 'oats', portions: 1, co2e: 0.018 },     // 30g grain
      { food_item_id: 'chicken', portions: 1, co2e: 0.22 },   // 100g protein
    ]

    render(<PlateViz items={items} />)

    // The component should render percentage text for categories
    // Total = 150 + 30 + 100 = 280g
    // Veg = 150/280 = ~54%, Grain = 30/280 = ~11%, Protein = 100/280 = ~36%
    expect(screen.getByText(/Veg & Fruit: 54%/)).toBeInTheDocument()
    expect(screen.getByText(/Whole Grains: 11%/)).toBeInTheDocument()
    expect(screen.getByText(/Protein: 36%/)).toBeInTheDocument()
  })

  it('should show ideal proportions in the legend', () => {
    const items: MealItem[] = [
      { food_item_id: 'potatoes', portions: 1, co2e: 0.03 },
    ]

    render(<PlateViz items={items} />)

    expect(screen.getByText(/ideal 50%/)).toBeInTheDocument()
  })

  it('should have accessible alt text describing proportions', () => {
    const items: MealItem[] = [
      { food_item_id: 'potatoes', portions: 1, co2e: 0.03 },
    ]

    render(<PlateViz items={items} />)

    const viz = screen.getByRole('img')
    expect(viz).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Veg & Fruit'),
    )
  })

  it('should have accessible alt text for empty state', () => {
    render(<PlateViz items={[]} />)

    const viz = screen.getByRole('img')
    expect(viz).toHaveAttribute(
      'aria-label',
      'Empty plate. Add items to see proportions.',
    )
  })

  it('should show Other category when items include other foods', () => {
    const items: MealItem[] = [
      { food_item_id: 'coffee-brewed', portions: 1, co2e: 0.015 },
    ]

    render(<PlateViz items={items} />)

    expect(screen.getByText(/Other: 100%/)).toBeInTheDocument()
  })
})
