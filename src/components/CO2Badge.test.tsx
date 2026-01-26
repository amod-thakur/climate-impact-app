import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CO2Badge from './CO2Badge'

describe('CO2Badge', () => {
  it('should display CO2e value formatted to 3 decimal places for small values', () => {
    render(<CO2Badge co2eKg={0.045} />)
    expect(screen.getByText('0.045 kg CO2e')).toBeInTheDocument()
  })

  it('should display CO2e value formatted to 2 decimal places for medium values', () => {
    render(<CO2Badge co2eKg={0.48} />)
    expect(screen.getByText('0.48 kg CO2e')).toBeInTheDocument()
  })

  it('should display CO2e value formatted to 1 decimal place for large values', () => {
    render(<CO2Badge co2eKg={2.6} />)
    expect(screen.getByText('2.6 kg CO2e')).toBeInTheDocument()
  })

  it('should show driving km equivalent for values >= 0.1 km', () => {
    // 1.0 kg CO2e = 4.0 km driving
    render(<CO2Badge co2eKg={1.0} />)
    expect(screen.getByText('~4.0 km driving')).toBeInTheDocument()
  })

  it('should not show driving km for very small values', () => {
    // 0.02 kg CO2e = 0.08 km (< 0.1 threshold)
    render(<CO2Badge co2eKg={0.02} />)
    expect(screen.queryByText(/km driving/)).not.toBeInTheDocument()
  })

  it('should apply green color for low emissions (< 0.5)', () => {
    const { container } = render(<CO2Badge co2eKg={0.1} />)
    const valueElement = container.querySelector('.text-co2-low')
    expect(valueElement).toBeInTheDocument()
  })

  it('should apply amber color for medium emissions (0.5-2.0)', () => {
    const { container } = render(<CO2Badge co2eKg={1.0} />)
    const valueElement = container.querySelector('.text-co2-medium')
    expect(valueElement).toBeInTheDocument()
  })

  it('should apply red color for high emissions (> 2.0)', () => {
    const { container } = render(<CO2Badge co2eKg={3.0} />)
    const valueElement = container.querySelector('.text-co2-high')
    expect(valueElement).toBeInTheDocument()
  })

  it('should include accessible label with CO2e and driving info', () => {
    render(<CO2Badge co2eKg={1.0} />)
    const badge = screen.getByLabelText(
      /1\.0 kilograms CO2 equivalent, like driving 4\.0 kilometers/,
    )
    expect(badge).toBeInTheDocument()
  })

  it('should accept sm size', () => {
    const { container } = render(<CO2Badge co2eKg={0.5} size="sm" />)
    expect(container.querySelector('.text-xs')).toBeInTheDocument()
  })

  it('should accept lg size', () => {
    const { container } = render(<CO2Badge co2eKg={0.5} size="lg" />)
    expect(container.querySelector('.text-base')).toBeInTheDocument()
  })
})
