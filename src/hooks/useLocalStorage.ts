import { useState, useCallback } from 'react'

/**
 * A generic custom hook that syncs React state with localStorage.
 *
 * Handles JSON serialization/deserialization and gracefully falls back
 * to `initialValue` when the key doesn't exist or the stored JSON is invalid.
 *
 * @param key - The localStorage key to read/write.
 * @param initialValue - The value to use when nothing is stored yet.
 * @returns A stateful value and a setter (same API as useState).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue =
          value instanceof Function ? value(prev) : value
        localStorage.setItem(key, JSON.stringify(nextValue))
        return nextValue
      })
    },
    [key],
  )

  return [storedValue, setValue]
}
