import { useState, useEffect, useRef, useCallback } from 'react'
import {
  exportData,
  triggerDownload,
  parseBackup,
  importData,
  mergeData,
} from '../utils/backup'
import type { BackupPreview } from '../utils/backup'

// ---------------------------------------------------------------------------
// Data sources from REQUIREMENTS.md §14
// ---------------------------------------------------------------------------

const DATA_SOURCES = [
  {
    label: 'Canadian Beef (NBSA / Holos)',
    url: 'https://www.beefresearch.ca/topics/environmental-footprint-of-beef-production/',
  },
  {
    label: 'Canadian Chicken (CFC LCA 2023)',
    url: 'https://www.chickenfarmers.ca/the-chicken-industry-life-cycle-assessment-lca/',
  },
  {
    label: 'Canadian Pork LCA',
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S0959652615017114',
  },
  {
    label: 'Canadian Eggs (EFC LCA 2022)',
    url: 'https://www.eggfarmers.ca/2023/09/what-makes-canadian-eggs-so-sustainable/',
  },
  {
    label: 'Canadian Dairy LCA',
    url: 'https://www.journalofdairyscience.org/article/S0022-0302(13)00479-7/fulltext',
  },
  {
    label: 'Canadian Dietary Average (Veeramani et al.)',
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S0959652621024628',
  },
  {
    label: 'Poore & Nemecek 2018 (global averages)',
    url: 'https://doi.org/10.1126/science.aaq0216',
  },
  {
    label: 'Our World in Data — GHG per kg of food',
    url: 'https://ourworldindata.org/grapher/ghg-per-kg-poore',
  },
  {
    label: "Canada's Food Guide (2019)",
    url: 'https://food-guide.canada.ca/en/',
  },
  {
    label: 'StatCan Household Food Emissions (2015)',
    url: 'https://www150.statcan.gc.ca/n1/pub/16-508-x/16-508-x2019004-eng.htm',
  },
  {
    label: 'AAFC Agricultural GHG Indicator',
    url: 'https://agriculture.canada.ca/en/agricultural-production/agricultural-greenhouse-gas-indicator',
  },
] as const

// ---------------------------------------------------------------------------
// Storage persistence hook (T-24)
// ---------------------------------------------------------------------------

function useStoragePersistence() {
  const [persisted, setPersisted] = useState<boolean | null>(() => {
    try {
      const stored = localStorage.getItem('storage_persisted')
      return stored !== null ? (JSON.parse(stored) as boolean) : null
    } catch {
      return null
    }
  })
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem('storage_banner_dismissed') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (persisted !== null) return // already requested

    async function requestPersistence() {
      if (navigator.storage && navigator.storage.persist) {
        const granted = await navigator.storage.persist()
        setPersisted(granted)
        localStorage.setItem('storage_persisted', JSON.stringify(granted))
      } else {
        // Browser doesn't support persist()
        setPersisted(false)
        localStorage.setItem('storage_persisted', 'false')
      }
    }
    requestPersistence()
  }, [persisted])

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true)
    localStorage.setItem('storage_banner_dismissed', 'true')
  }, [])

  const showBanner = persisted === false && !bannerDismissed

  return { persisted, showBanner, dismissBanner }
}

// ---------------------------------------------------------------------------
// Import modal states
// ---------------------------------------------------------------------------

type ImportStep =
  | { kind: 'idle' }
  | { kind: 'preview'; preview: BackupPreview; rawJson: string }
  | { kind: 'error'; message: string }
  | { kind: 'success'; message: string }

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------

function SettingsPage() {
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [importStep, setImportStep] = useState<ImportStep>({ kind: 'idle' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { persisted, showBanner, dismissBanner } = useStoragePersistence()

  // --- Export handler (T-22) ---
  function handleExport() {
    const json = exportData()
    const date = new Date().toISOString().slice(0, 10)
    triggerDownload(json, `co2-tracker-backup-${date}.json`)
    setExportMessage('Backup downloaded.')
    setTimeout(() => setExportMessage(null), 3000)
  }

  // --- Import handler (T-23) ---
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const preview = parseBackup(text)
      if (!preview) {
        setImportStep({
          kind: 'error',
          message:
            'Invalid backup file. Please select a valid CO2 Tracker backup (.json).',
        })
      } else {
        setImportStep({ kind: 'preview', preview, rawJson: text })
      }
    }
    reader.onerror = () => {
      setImportStep({ kind: 'error', message: 'Failed to read the file.' })
    }
    reader.readAsText(file)

    // Reset file input so re-selecting the same file triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleImportReplace() {
    if (importStep.kind !== 'preview') return
    const ok = importData(importStep.rawJson)
    if (ok) {
      setImportStep({
        kind: 'success',
        message: `Imported ${importStep.preview.mealCount} meals (replaced existing data). Reload the page to see changes.`,
      })
    } else {
      setImportStep({ kind: 'error', message: 'Import failed unexpectedly.' })
    }
  }

  function handleImportMerge() {
    if (importStep.kind !== 'preview') return
    const ok = mergeData(importStep.rawJson)
    if (ok) {
      setImportStep({
        kind: 'success',
        message: `Merged ${importStep.preview.mealCount} meals with existing data. Reload the page to see changes.`,
      })
    } else {
      setImportStep({ kind: 'error', message: 'Merge failed unexpectedly.' })
    }
  }

  function resetImport() {
    setImportStep({ kind: 'idle' })
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Backup, restore, and data sources.
      </p>

      {/* Storage persistence banner (T-24) */}
      {showBanner && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-lg border border-co2-medium/30 bg-co2-medium/10 p-4"
        >
          <span className="mt-0.5 text-co2-medium" aria-hidden="true">
            &#9888;
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">
              Your browser may clear saved data after inactivity.
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Use the Export button below to back up your meals regularly.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissBanner}
            className="min-h-[44px] min-w-[44px] rounded text-text-secondary hover:text-text-primary"
            aria-label="Dismiss storage warning"
          >
            &#10005;
          </button>
        </div>
      )}

      {/* --- Backup section (T-22) --- */}
      <section className="mt-6" aria-labelledby="backup-heading">
        <h2
          id="backup-heading"
          className="text-lg font-semibold text-text-primary"
        >
          Backup
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Export your data as a JSON file for safekeeping.
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="mt-3 min-h-[44px] rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Export my data
        </button>
        {exportMessage && (
          <p className="mt-2 text-sm text-co2-low" role="status">
            {exportMessage}
          </p>
        )}
      </section>

      {/* --- Import / Restore section (T-23) --- */}
      <section className="mt-8" aria-labelledby="restore-heading">
        <h2
          id="restore-heading"
          className="text-lg font-semibold text-text-primary"
        >
          Restore
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Import a previously exported backup file.
        </p>

        {importStep.kind === 'idle' && (
          <div className="mt-3">
            <label
              htmlFor="import-file"
              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
            >
              Choose backup file
            </label>
            <input
              id="import-file"
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="sr-only"
            />
          </div>
        )}

        {importStep.kind === 'preview' && (
          <div className="mt-3 rounded-lg border border-border bg-surface-secondary p-4">
            <p className="text-sm text-text-primary">
              This backup contains{' '}
              <strong>{importStep.preview.mealCount}</strong> meal
              {importStep.preview.mealCount !== 1 ? 's' : ''} from{' '}
              <strong>{importStep.preview.dateCount}</strong> date
              {importStep.preview.dateCount !== 1 ? 's' : ''}.
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Exported on{' '}
              {new Date(importStep.preview.exportedAt).toLocaleDateString()}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleImportMerge}
                className="min-h-[44px] rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Merge with existing data
              </button>
              <button
                type="button"
                onClick={handleImportReplace}
                className="min-h-[44px] rounded-lg border border-co2-high px-5 py-2.5 text-sm font-medium text-co2-high transition-colors hover:bg-co2-high/10"
              >
                Replace existing data
              </button>
              <button
                type="button"
                onClick={resetImport}
                className="min-h-[44px] rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {importStep.kind === 'error' && (
          <div className="mt-3 rounded-lg border border-co2-high/30 bg-co2-high/10 p-4">
            <p className="text-sm text-co2-high" role="alert">
              {importStep.message}
            </p>
            <button
              type="button"
              onClick={resetImport}
              className="mt-2 min-h-[44px] text-sm font-medium text-text-secondary underline hover:text-text-primary"
            >
              Try again
            </button>
          </div>
        )}

        {importStep.kind === 'success' && (
          <div className="mt-3 rounded-lg border border-co2-low/30 bg-co2-low/10 p-4">
            <p className="text-sm text-co2-low" role="status">
              {importStep.message}
            </p>
            <button
              type="button"
              onClick={resetImport}
              className="mt-2 min-h-[44px] text-sm font-medium text-text-secondary underline hover:text-text-primary"
            >
              Done
            </button>
          </div>
        )}
      </section>

      {/* --- Storage section (T-24) --- */}
      <section className="mt-8" aria-labelledby="storage-heading">
        <h2
          id="storage-heading"
          className="text-lg font-semibold text-text-primary"
        >
          Storage
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          All data is stored locally on your device.
        </p>
        <div className="mt-3 rounded-lg border border-border bg-surface-secondary p-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                persisted === true
                  ? 'bg-co2-low'
                  : persisted === false
                    ? 'bg-co2-medium'
                    : 'bg-border'
              }`}
              aria-hidden="true"
            />
            <p className="text-sm text-text-primary">
              Persistent storage:{' '}
              {persisted === true
                ? 'Granted'
                : persisted === false
                  ? 'Not available'
                  : 'Checking...'}
            </p>
          </div>
          {persisted === false && (
            <p className="mt-2 text-xs text-text-secondary">
              Your browser may clear data after extended inactivity. Export
              backups regularly.
            </p>
          )}
        </div>
      </section>

      {/* --- About / Sources section (T-21) --- */}
      <section className="mt-8" aria-labelledby="sources-heading">
        <h2
          id="sources-heading"
          className="text-lg font-semibold text-text-primary"
        >
          About &amp; Data Sources
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Every number in this app is traceable to a cited source.
        </p>
        <ul className="mt-3 space-y-2">
          {DATA_SOURCES.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline hover:text-primary-dark"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Version --- */}
      <footer className="mt-8 border-t border-border pb-8 pt-4">
        <p className="text-xs text-text-secondary">
          CO2 Food Tracker &middot; v0.1.0 &middot; All data stays on your
          device.
        </p>
      </footer>
    </div>
  )
}

export default SettingsPage
