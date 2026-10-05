import { describe, expect, it, vi } from 'vitest'
import { loadTodos, saveTodos, STORAGE_KEY } from '../src/utils/storage'

describe('browser storage', () => {
  it('loads an empty list when no saved data exists', () => {
    expect(loadTodos()).toEqual({ todos: [], error: null })
  })
  it('round-trips task data', () => {
    const todos = [{ id: '1', title: 'Demo', completed: true }]
    expect(saveTodos(todos)).toBe(true)
    expect(loadTodos()).toEqual({ todos, error: null })
  })
  it.each(['broken', '{}', 'null', '[null]', '[{"id":"1","title":"Task","completed":"false"}]',
    '[{"id":"1","title":"A","completed":false},{"id":"1","title":"B","completed":true}]'])('handles corrupt data: %s', raw => {
    localStorage.setItem(STORAGE_KEY, raw)
    expect(loadTodos().error).not.toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw)
  })
  it('handles blocked storage access', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Denied') })
    expect(loadTodos().error).not.toBeNull()
  })
})
