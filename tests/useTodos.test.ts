import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useTodos } from '../src/hooks/useTodos'
import { STORAGE_KEY } from '../src/utils/storage'

describe('useTodos', () => {
  it.each(['', '   ', '\n\t'])('rejects a blank new title: %j', title => {
    const { result } = renderHook(useTodos)
    act(() => { expect(result.current.addTodo(title)).toBe(false) })
    expect(result.current.todos).toEqual([])
  })

  it('trims valid titles and assigns unique IDs', () => {
    const { result } = renderHook(useTodos)
    act(() => { result.current.addTodo('  Read notes  '); result.current.addTodo('Read notes') })
    expect(result.current.todos.map(todo => todo.title)).toEqual(['Read notes', 'Read notes'])
    expect(new Set(result.current.todos.map(todo => todo.id)).size).toBe(2)
  })

  it('keeps completed state while editing and removes only the requested task', () => {
    const { result } = renderHook(useTodos)
    act(() => { result.current.addTodo('First'); result.current.addTodo('Second') })
    const [first, second] = result.current.todos
    act(() => { result.current.toggleTodo(first.id); result.current.editTodo(first.id, 'Updated') })
    expect(result.current.todos[0]).toEqual({ ...first, title: 'Updated', completed: true })
    act(() => result.current.deleteTodo(second.id))
    expect(result.current.todos).toHaveLength(1)
    act(() => result.current.clearCompleted())
    expect(result.current.todos).toEqual([])
  })

  it('does not overwrite unreadable stored data', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid')
    const { result } = renderHook(useTodos)
    act(() => result.current.addTodo('Session task'))
    expect(result.current.storageError).toMatch(/could not be read/)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{invalid')
  })

  it('reports failed writes while allowing session-only work', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
    const { result } = renderHook(useTodos)
    act(() => result.current.addTodo('Session task'))
    expect(result.current.todos[0].title).toBe('Session task')
    expect(result.current.storageError).toMatch(/could not be saved/)
  })
})
