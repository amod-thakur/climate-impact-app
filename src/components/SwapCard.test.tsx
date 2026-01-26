import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SwapCard from './SwapCard'
import type { SwapSuggestion } from '../utils/swap'

describe('SwapCard', () => {
  const MOCK_SUGGESTION: SwapSuggestion = {
    currentItemId: 'beef',
    currentItemName: 'Beef',
    currentCO2e: 2.6,
    suggestedItemId: 'chicken',
    suggestedItemName: 'Chicken',
    suggestedCO2e: 0.22,
    savingsKg: 2.38,
    savingsKm: 9.52,
  }

  it('should render nothing when suggestion is null', () => {
    const { container } = render(<SwapCard suggestion={null} />)
    expect(container.innerHTML).toBe('')
  })

  it('should show the current high-impact item name', () => {
    render(<SwapCard suggestion={MOCK_SUGGESTION} />)
    expect(screen.getByText(/Beef/)).toBeInTheDocument()
  })

  it('should show the suggested alternative item name', () => {
    render(<SwapCard suggestion={MOCK_SUGGESTION} />)
    expect(screen.getByText(/Chicken/)).toBeInTheDocument()
  })

  it('should show CO2e savings in kg', () => {
    render(<SwapCard suggestion={MOCK_SUGGESTION} />)
    expect(screen.getByText(/2\.38 kg CO2e/)).toBeInTheDocument()
  })

  it('should show driving km savings', () => {
    render(<SwapCard suggestion={MOCK_SUGGESTION} />)
    expect(screen.getByText(/9\.5 km less/)).toBeInTheDocument()
  })

  it('should use neutral tone with "Swapping to" phrasing', () => {
    render(<SwapCard suggestion={MOCK_SUGGESTION} />)
    expect(screen.getByText(/Swapping to/)).toBeInTheDocument()
  })

  it('should show the current item CO2e value', () => {
    render(<SwapCard suggestion={MOCK_SUGGESTION} />)
    expect(screen.getByText(/2\.60 kg CO2e/)).toBeInTheDocument()
  })

  it('should display the Swap Suggestion heading', () => {
    render(<SwapCard suggestion={MOCK_SUGGESTION} />)
    expect(screen.getByText('Swap Suggestion')).toBeInTheDocument()
  })
})
