import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import NavBar from './NavBar'

// Wouter needs no extra provider for basic tests — it defaults to memory location.

describe('NavBar', () => {
  it('should render all four navigation tabs', () => {
    render(<NavBar />)

    expect(screen.getAllByRole('tab', { name: 'Explorer' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('tab', { name: 'Builder' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('tab', { name: 'History' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('tab', { name: 'Settings' }).length).toBeGreaterThanOrEqual(1)
  })

  it('should highlight the active tab', () => {
    render(<NavBar />)

    // Default location is "/", so Explorer should be active
    const explorerTabs = screen.getAllByRole('tab', { name: 'Explorer' })
    // At least one of the Explorer tabs (mobile or desktop) should be active
    const isActive = explorerTabs.some(
      (tab) => tab.getAttribute('aria-selected') === 'true',
    )
    expect(isActive).toBe(true)
  })

  it('should have keyboard-navigable tabs', async () => {
    render(<NavBar />)
    const user = userEvent.setup()

    // Tab into the nav — all links should be tabbable
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThanOrEqual(4)

    await user.tab()
    // Some tab element should have focus
    expect(document.activeElement?.tagName).toBe('A')
  })

  it('should render proper aria labels for accessibility', () => {
    render(<NavBar />)

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toBeInTheDocument()
  })
})
