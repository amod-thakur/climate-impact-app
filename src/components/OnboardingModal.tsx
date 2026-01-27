import { useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'wouter'
import { useLocalStorage } from '../hooks/useLocalStorage'

function OnboardingModal() {
  const [seen, setSeen] = useLocalStorage('onboarding_seen', false)
  const [, navigate] = useLocation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const dismiss = useCallback(() => {
    setSeen(true)
    navigate('/')
  }, [setSeen, navigate])

  // Focus trap and Escape key
  useEffect(() => {
    if (seen) return

    closeButtonRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        dismiss()
        return
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [seen, dismiss])

  if (seen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to CO2 Tracker"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-xl"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 min-h-[44px] min-w-[44px] rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          aria-label="Close onboarding"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-text-primary">
          Welcome to CO2 Tracker
        </h2>

        <ul className="mt-4 space-y-3">
          <li className="flex gap-3 text-sm text-text-secondary">
            <span className="mt-0.5 flex-shrink-0 text-primary" aria-hidden="true">1.</span>
            <span>Food is responsible for 25% of global greenhouse gas emissions.</span>
          </li>
          <li className="flex gap-3 text-sm text-text-secondary">
            <span className="mt-0.5 flex-shrink-0 text-primary" aria-hidden="true">2.</span>
            <span>
              In Canada, the average person&apos;s food creates ~4 kg CO2e per
              day — like driving 16 km.
            </span>
          </li>
          <li className="flex gap-3 text-sm text-text-secondary">
            <span className="mt-0.5 flex-shrink-0 text-primary" aria-hidden="true">3.</span>
            <span>This app helps you see which foods matter most.</span>
          </li>
          <li className="flex gap-3 text-sm text-text-secondary">
            <span className="mt-0.5 flex-shrink-0 text-primary" aria-hidden="true">4.</span>
            <span>All data is Canadian where available, with cited sources.</span>
          </li>
        </ul>

        <button
          type="button"
          onClick={dismiss}
          className="mt-6 min-h-[44px] w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Start Exploring
        </button>
      </div>
    </div>
  )
}

export default OnboardingModal
