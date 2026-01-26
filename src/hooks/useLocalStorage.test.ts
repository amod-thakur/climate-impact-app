import { describe, expect, it, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initialValue when key does not exist in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('missing', 42))
    expect(result.current[0]).toBe(42)
  })

  it('returns stored value when key exists in localStorage', () => {
    localStorage.setItem('existing', JSON.stringify('hello'))
    const { result } = renderHook(() => useLocalStorage('existing', 'default'))
    expect(result.current[0]).toBe('hello')
  })

  it('updates both React state and localStorage on setValue', () => {
    const { result } = renderHook(() => useLocalStorage('key', 0))

    act(() => {
      result.current[1](99)
    })

    expect(result.current[0]).toBe(99)
    expect(JSON.parse(localStorage.getItem('key')!)).toBe(99)
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 10))

    act(() => {
      result.current[1]((prev) => prev + 5)
    })

    expect(result.current[0]).toBe(15)
    expect(JSON.parse(localStorage.getItem('counter')!)).toBe(15)
  })

  it('falls back to initialValue when stored JSON is invalid', () => {
    localStorage.setItem('broken', '{not valid json')
    const { result } = renderHook(() => useLocalStorage('broken', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('handles complex objects', () => {
    const initial: { meals: { id: string }[]; version: number } = { meals: [], version: 1 }
    const { result } = renderHook(() => useLocalStorage('data', initial))

    const updated = { meals: [{ id: '1' }], version: 2 }
    act(() => {
      result.current[1](updated)
    })

    expect(result.current[0]).toEqual(updated)
    expect(JSON.parse(localStorage.getItem('data')!)).toEqual(updated)
  })

  it('handles arrays', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('list', []))

    act(() => {
      result.current[1](['a', 'b', 'c'])
    })

    expect(result.current[0]).toEqual(['a', 'b', 'c'])
  })

  it('persists value across re-renders with the same key', () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage('persist', 'initial'),
    )

    act(() => {
      result.current[1]('updated')
    })

    rerender()

    expect(result.current[0]).toBe('updated')
  })

  it('handles boolean values', () => {
    const { result } = renderHook(() =>
      useLocalStorage('flag', false),
    )

    act(() => {
      result.current[1](true)
    })

    expect(result.current[0]).toBe(true)
    expect(JSON.parse(localStorage.getItem('flag')!)).toBe(true)
  })

  it('handles null values', () => {
    const { result } = renderHook(() =>
      useLocalStorage<string | null>('nullable', null),
    )

    expect(result.current[0]).toBeNull()

    act(() => {
      result.current[1]('not null')
    })

    expect(result.current[0]).toBe('not null')
  })
})
