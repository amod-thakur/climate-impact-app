import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import SettingsPage from './SettingsPage'

const validBackup = {
  version: 1,
  exported_at: '2025-01-15T12:00:00Z',
  meals: [
    {
      id: 'meal-1',
      date: '2025-01-15',
      label: 'Lunch',
      items: [{ food_item_id: 'beef', portions: 1, co2e: 2.6 }],
      total_co2e: 2.6,
      driving_km_equivalent: 10.4,
    },
  ],
}

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    // Pre-set storage_persisted to avoid async effect firing during tests
    localStorage.setItem('storage_persisted', 'true')
  })

  it('renders the page title and subtitle', () => {
    render(<SettingsPage />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(
      screen.getByText('Backup, restore, and data sources.'),
    ).toBeInTheDocument()
  })

  // --- T-21: Layout sections ---
  it('renders Backup, Restore, Storage, and About sections', () => {
    render(<SettingsPage />)

    expect(screen.getByText('Backup')).toBeInTheDocument()
    expect(screen.getByText('Restore')).toBeInTheDocument()
    expect(screen.getByText('Storage')).toBeInTheDocument()
    expect(screen.getByText('About & Data Sources')).toBeInTheDocument()
  })

  it('renders all data source links', () => {
    render(<SettingsPage />)

    expect(
      screen.getByText('Canadian Beef (NBSA / Holos)'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Canadian Chicken (CFC LCA 2023)'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Poore & Nemecek 2018 (global averages)'),
    ).toBeInTheDocument()
    expect(
      screen.getByText("Canada's Food Guide (2019)"),
    ).toBeInTheDocument()
  })

  it('renders data source links with target="_blank"', () => {
    render(<SettingsPage />)

    const link = screen.getByText('Canadian Beef (NBSA / Holos)')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('displays app version', () => {
    render(<SettingsPage />)

    expect(screen.getByText(/v0\.1\.0/)).toBeInTheDocument()
  })

  // --- T-22: Export ---
  it('renders the export button', () => {
    render(<SettingsPage />)

    expect(
      screen.getByRole('button', { name: 'Export my data' }),
    ).toBeInTheDocument()
  })

  it('shows confirmation message after export', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    await user.click(screen.getByRole('button', { name: 'Export my data' }))

    expect(screen.getByText('Backup downloaded.')).toBeInTheDocument()
  })

  // --- T-23: Import ---
  it('renders the import file input', () => {
    render(<SettingsPage />)

    expect(screen.getByText('Choose backup file')).toBeInTheDocument()
    const input = document.getElementById('import-file') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.type).toBe('file')
    expect(input.accept).toBe('.json')
  })

  it('shows error for invalid backup file', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const input = document.getElementById('import-file') as HTMLInputElement
    const badFile = new File(['not json at all'], 'bad.json', {
      type: 'application/json',
    })

    await user.upload(input, badFile)

    expect(
      await screen.findByText(/Invalid backup file/),
    ).toBeInTheDocument()
  })

  it('shows preview for valid backup file', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const input = document.getElementById('import-file') as HTMLInputElement
    const file = new File([JSON.stringify(validBackup)], 'backup.json', {
      type: 'application/json',
    })

    await user.upload(input, file)

    await waitFor(() => {
      expect(
        screen.getByText(/This backup contains/),
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: 'Merge with existing data' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Replace existing data' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument()
  })

  it('can cancel an import preview', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const input = document.getElementById('import-file') as HTMLInputElement
    const file = new File([JSON.stringify(validBackup)], 'backup.json', {
      type: 'application/json',
    })

    await user.upload(input, file)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    // Should return to idle state with file chooser visible
    expect(screen.getByText('Choose backup file')).toBeInTheDocument()
  })

  it('shows success message after replace import', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const input = document.getElementById('import-file') as HTMLInputElement
    const file = new File([JSON.stringify(validBackup)], 'backup.json', {
      type: 'application/json',
    })

    await user.upload(input, file)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Replace existing data' }),
      ).toBeInTheDocument()
    })
    await user.click(
      screen.getByRole('button', { name: 'Replace existing data' }),
    )

    expect(
      await screen.findByText(/replaced existing data/),
    ).toBeInTheDocument()
  })

  it('shows success message after merge import', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const input = document.getElementById('import-file') as HTMLInputElement
    const file = new File([JSON.stringify(validBackup)], 'backup.json', {
      type: 'application/json',
    })

    await user.upload(input, file)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Merge with existing data' }),
      ).toBeInTheDocument()
    })
    await user.click(
      screen.getByRole('button', { name: 'Merge with existing data' }),
    )

    expect(await screen.findByText(/Merged/)).toBeInTheDocument()
  })

  // --- T-24: Storage persistence ---
  it('shows storage status section', () => {
    render(<SettingsPage />)

    expect(screen.getByText(/Persistent storage:/)).toBeInTheDocument()
  })

  it('shows persistent storage as Granted when persisted', () => {
    localStorage.setItem('storage_persisted', 'true')
    render(<SettingsPage />)

    expect(screen.getByText(/Granted/)).toBeInTheDocument()
  })

  it('shows warning banner when persistence is denied', () => {
    localStorage.setItem('storage_persisted', 'false')
    render(<SettingsPage />)

    expect(
      screen.getByText(
        'Your browser may clear saved data after inactivity.',
      ),
    ).toBeInTheDocument()
  })

  it('can dismiss the storage warning banner', async () => {
    const user = userEvent.setup()
    localStorage.setItem('storage_persisted', 'false')
    render(<SettingsPage />)

    const dismissBtn = screen.getByRole('button', {
      name: 'Dismiss storage warning',
    })
    await user.click(dismissBtn)

    expect(
      screen.queryByText(
        'Your browser may clear saved data after inactivity.',
      ),
    ).not.toBeInTheDocument()
    expect(localStorage.getItem('storage_banner_dismissed')).toBe('true')
  })

  it('does not show banner when persistence is granted', () => {
    localStorage.setItem('storage_persisted', 'true')
    render(<SettingsPage />)

    expect(
      screen.queryByText(
        'Your browser may clear saved data after inactivity.',
      ),
    ).not.toBeInTheDocument()
  })

  it('does not show banner if already dismissed', () => {
    localStorage.setItem('storage_persisted', 'false')
    localStorage.setItem('storage_banner_dismissed', 'true')
    render(<SettingsPage />)

    expect(
      screen.queryByText(
        'Your browser may clear saved data after inactivity.',
      ),
    ).not.toBeInTheDocument()
  })
})
