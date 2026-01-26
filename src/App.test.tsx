import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { memoryLocation } from 'wouter/memory-location'
import { Router } from 'wouter'
import App from './App'

function renderAtRoute(path: string, { isStatic = true } = {}) {
  const { hook } = memoryLocation({ path, static: isStatic })
  return render(
    <Router hook={hook}>
      <App />
    </Router>,
  )
}

describe('App routing', () => {
  it('should render ExplorerPage at /', () => {
    renderAtRoute('/')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Food Explorer' }),
    ).toBeInTheDocument()
  })

  it('should render BuilderPage at /build', () => {
    renderAtRoute('/build')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Meal Builder' }),
    ).toBeInTheDocument()
  })

  it('should render HistoryPage at /history', () => {
    renderAtRoute('/history')
    expect(
      screen.getByRole('heading', { level: 1, name: 'History' }),
    ).toBeInTheDocument()
  })

  it('should render SettingsPage at /settings', () => {
    renderAtRoute('/settings')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Settings' }),
    ).toBeInTheDocument()
  })

  it('should redirect unknown routes to /', () => {
    renderAtRoute('/nonexistent', { isStatic: false })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Food Explorer' }),
    ).toBeInTheDocument()
  })

  it('should redirect /unknown/nested to /', () => {
    renderAtRoute('/unknown/nested', { isStatic: false })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Food Explorer' }),
    ).toBeInTheDocument()
  })
})
