import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('useLocalStorage', () => {
  it('returns initialValue when key does not exist', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 42))
    expect(result.current[0]).toBe(42)
  })

  it('reads existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('hello'))
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default'),
    )
    expect(result.current[0]).toBe('hello')
  })

  it('writes value to localStorage on setValue', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial'),
    )

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('updated')
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(1)
    expect(JSON.parse(localStorage.getItem('counter')!)).toBe(1)
  })

  it('falls back to initialValue on invalid JSON', () => {
    localStorage.setItem('bad-json', '{broken')
    const { result } = renderHook(() =>
      useLocalStorage('bad-json', 'fallback'),
    )
    expect(result.current[0]).toBe('fallback')
  })

  it('handles complex objects', () => {
    const initial: { meals: { id: string }[]; version: number } = {
      meals: [],
      version: 1,
    }
    const { result } = renderHook(() =>
      useLocalStorage('app-data', initial),
    )

    const updated = { meals: [{ id: 'meal-1' }], version: 2 }
    act(() => {
      result.current[1](updated)
    })

    expect(result.current[0]).toEqual(updated)
    expect(JSON.parse(localStorage.getItem('app-data')!)).toEqual(updated)
  })

  it('handles arrays', () => {
    const { result } = renderHook(() =>
      useLocalStorage<string[]>('items', []),
    )

    act(() => {
      result.current[1](['a', 'b', 'c'])
    })

    expect(result.current[0]).toEqual(['a', 'b', 'c'])
  })

  it('persists across re-renders with same key', () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage('persist-key', 'init'),
    )

    act(() => {
      result.current[1]('saved')
    })

    rerender()

    expect(result.current[0]).toBe('saved')
  })
})
